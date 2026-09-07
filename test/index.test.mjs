import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  apply,
  createToken,
  createWeatherTool,
  getWeatherText,
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
    assert.equal(fixture.config.timeoutMs, 15_000)
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

test('getWeatherText keeps current conditions when forecast fails', async () => {
  const calls = []
  const request = async (_config, endpoint) => {
    calls.push(endpoint)
    if (endpoint === '/geo/v2/city/lookup') {
      return { location: [{ id: '101', adm1: 'Example Province', adm2: 'Example City', name: 'Example City' }] }
    }
    if (endpoint === '/v7/weather/now') {
      return {
        now: {
          text: 'Cloudy', temp: '20', feelsLike: '19', obsTime: '2026-01-02T03:04+00:00',
          humidity: '50', windDir: 'North', windScale: '2', precip: '0.0', pressure: '1000', vis: '10',
        },
      }
    }
    throw new Error('forecast unavailable')
  }
  const result = await getWeatherText({}, 'Example City', request)
  assert.deepEqual(calls, ['/geo/v2/city/lookup', '/v7/weather/now', '/v7/weather/3d'])
  assert.equal(result.location, 'Example Province Example City')
  assert.match(result.text, /Cloudy 20℃/u)
  assert.doesNotMatch(result.text, /查询失败/u)
})

test('tool uses trimmed input or the configured default location', async () => {
  const locations = []
  const tool = createWeatherTool({ defaultLocation: 'Default City' }, async (_config, location) => {
    locations.push(location)
    return { location, text: location }
  })
  await tool.execute({ location: '  Named City  ' })
  await tool.execute({})
  assert.deepEqual(locations, ['Named City', 'Default City'])
})

test('apply owns registration through ctx.effect', () => {
  const fixture = fixtureConfig()
  try {
    let registered
    let disposed = false
    let cleanup
    const ctx = {
      tools: {
        register(tool) {
          registered = tool
          return () => { disposed = true }
        },
      },
      effect(factory) {
        cleanup = factory()
      },
    }
    apply(ctx, {
      apiHost: fixture.config.apiHost,
      keyId: fixture.config.keyId,
      projectId: fixture.config.projectId,
      privateKeyFile: fixture.config.privateKeyFile,
      defaultLocation: fixture.config.defaultLocation,
    })
    assert.equal(registered.name, 'get_weather')
    cleanup()
    assert.equal(disposed, true)
  } finally {
    fixture.cleanup()
  }
})
