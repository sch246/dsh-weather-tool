import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  createToken,
  requestJson,
  resolveConfig,
} from '../packages/dsh-weather-tool/index.mjs'

function fixtureConfig() {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-weather-tool-'))
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const privateKeyFile = join(directory, 'fixture-private.pem')
  writeFileSync(privateKeyFile, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 })
  const config = resolveConfig({
    apiHost: 'weather.example.invalid',
    keyId: 'fixture-key',
    projectId: 'fixture-project',
    privateKeyFile,
    defaultLocation: 'Example City',
  })
  return { config, publicKey, cleanup: () => rmSync(directory, { recursive: true, force: true }) }
}

test('resolveConfig validates host and Ed25519 key material', () => {
  const fixture = fixtureConfig()
  try {
    assert.equal(fixture.config.apiHost, 'weather.example.invalid')
    assert.throws(
      () => resolveConfig({ ...fixture.config, apiHost: 'https://weather.example.invalid' }),
      /hostname without a scheme or path/,
    )
  } finally {
    fixture.cleanup()
  }
})

test('createToken signs the expected short-lived JWT claims', () => {
  const fixture = fixtureConfig()
  try {
    const token = createToken(fixture.config, 10_000)
    const [headerPart, payloadPart, signaturePart] = token.split('.')
    assert.deepEqual(JSON.parse(Buffer.from(headerPart, 'base64url')), { alg: 'EdDSA', kid: 'fixture-key' })
    assert.deepEqual(JSON.parse(Buffer.from(payloadPart, 'base64url')), {
      iat: 9_970,
      exp: 10_900,
      sub: 'fixture-project',
    })
    assert.equal(
      verify(null, Buffer.from(`${headerPart}.${payloadPart}`), fixture.publicKey, Buffer.from(signaturePart, 'base64url')),
      true,
    )
  } finally {
    fixture.cleanup()
  }
})

test('requestJson sends the configured host, query, and bearer token', async () => {
  const fixture = fixtureConfig()
  try {
    let observed
    const payload = await requestJson(fixture.config, '/v7/weather/now', { location: '101' }, async (url, init) => {
      observed = { url, init }
      return { ok: true, json: async () => ({ code: '200', now: {} }) }
    })
    assert.equal(payload.code, '200')
    assert.equal(observed.url.hostname, 'weather.example.invalid')
    assert.equal(observed.url.searchParams.get('location'), '101')
    assert.match(observed.init.headers.Authorization, /^Bearer [^.]+\.[^.]+\.[^.]+$/u)
  } finally {
    fixture.cleanup()
  }
})
