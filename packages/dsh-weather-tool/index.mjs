/**
 * Import-free DSH Host plugin that registers `get_weather` over QWeather.
 * Deployment identity and credentials arrive only through plugin config.
 */

import { createPrivateKey, sign } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

export const name = 'dsh-weather-tool'
export const inject = ['tools']

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function requiredString(raw, field) {
  const value = raw?.[field]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name}: config.${field} must be a non-empty string`)
  }
  return value.trim()
}

function normalizeApiHost(value) {
  if (!/^[a-z0-9.-]+(?::\d+)?$/iu.test(value) || value.includes('..')) {
    throw new TypeError(`${name}: config.apiHost must be a hostname without a scheme or path`)
  }
  return value
}

/** Validate deployment config and load its Ed25519 private key. */
export function resolveConfig(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError(`${name}: config must be an object`)
  }

  const timeoutMs = raw.timeoutMs ?? 15_000
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1_000) {
    throw new TypeError(`${name}: config.timeoutMs must be a finite number of at least 1000`)
  }

  const privateKeyFile = requiredString(raw, 'privateKeyFile')
  let privateKey
  try {
    privateKey = createPrivateKey(readFileSync(
      isAbsolute(privateKeyFile) ? privateKeyFile : resolve(privateKeyFile),
      'utf8',
    ))
  } catch (error) {
    throw new Error(`${name}: cannot load private key ${privateKeyFile}: ${errorMessage(error)}`)
  }
  if (privateKey.asymmetricKeyType !== 'ed25519') {
    throw new TypeError(`${name}: config.privateKeyFile must contain an Ed25519 private key`)
  }

  return {
    apiHost: normalizeApiHost(requiredString(raw, 'apiHost')),
    keyId: requiredString(raw, 'keyId'),
    projectId: requiredString(raw, 'projectId'),
    privateKeyFile,
    defaultLocation: requiredString(raw, 'defaultLocation'),
    timeoutMs,
    privateKey,
  }
}

/** Create a short-lived QWeather JWT. */
export function createToken(config, nowSeconds = Math.floor(Date.now() / 1_000)) {
  const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', kid: config.keyId })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iat: nowSeconds - 30,
    exp: nowSeconds + 900,
    sub: config.projectId,
  })).toString('base64url')
  const signingInput = `${header}.${payload}`
  const signature = sign(null, Buffer.from(signingInput), config.privateKey).toString('base64url')
  return `${signingInput}.${signature}`
}

/** Perform one authenticated QWeather GET and reject transport or API errors. */
export async function requestJson(config, endpoint, params, fetchImpl = globalThis.fetch) {
  const url = new URL(`https://${config.apiHost}${endpoint}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${createToken(config)}` },
    signal: AbortSignal.timeout(config.timeoutMs),
  })
  if (!response.ok) {
    throw new Error(`QWeather HTTP ${response.status} ${response.statusText}`)
  }
  const payload = await response.json()
  if (payload?.code !== '200') {
    throw new Error(`QWeather API code ${payload?.code ?? 'unknown'}`)
  }
  return payload
}

/** Resolve one user-supplied place to the first matching QWeather city. */
export async function searchCity(config, location, request = requestJson) {
  const payload = await request(config, '/geo/v2/city/lookup', { location, lang: 'zh' })
  return Array.isArray(payload.location) && payload.location.length > 0 ? payload.location[0] : null
}

function cityLabel(city) {
  const parts = []
  for (const value of [city.adm1, city.adm2, city.name]) {
    if (typeof value === 'string' && value !== '' && !parts.includes(value)) parts.push(value)
  }
  return parts.join(' ')
}

function dateText(value) {
  return typeof value === 'string' ? value.replace('T', ' ').slice(0, 16) : ''
}

function dayText(day) {
  const date = typeof day.fxDate === 'string' ? day.fxDate.slice(5).replace('-', '/') : '?'
  return `${date} ${day.textDay ?? ''} ${day.tempMin ?? '?'}~${day.tempMax ?? '?'}℃`
}

/** Query current conditions and retain them when the optional forecast fails. */
export async function getWeatherText(config, location, request = requestJson) {
  try {
    const city = await searchCity(config, location, request)
    if (city === null) {
      return { location, text: `没有找到「${location}」对应的城市，换个城市名或坐标试试。` }
    }

    const label = cityLabel(city)
    const realtime = await request(config, '/v7/weather/now', { location: city.id, unit: 'm' })
    const current = realtime.now ?? {}
    const lines = [
      `📍 ${label} 当前天气`,
      `${current.text ?? ''} ${current.temp ?? '?'}℃（体感 ${current.feelsLike ?? '?'}℃）`,
      `观测 ${dateText(current.obsTime)} · 湿度 ${current.humidity ?? '?'}% · ${current.windDir ?? ''}${current.windScale ?? '?'}级`,
      `降水 ${current.precip ?? '?'}mm · 气压 ${current.pressure ?? '?'}hPa · 能见度 ${current.vis ?? '?'}km`,
    ]

    try {
      const forecast = await request(config, '/v7/weather/3d', { location: city.id, unit: 'm' })
      if (Array.isArray(forecast.daily) && forecast.daily.length > 0) {
        lines.push(`未来三天：${forecast.daily.map(dayText).join('；')}`)
      }
    } catch {
      // Current conditions remain useful when the optional outlook is unavailable.
    }
    return { location: label, text: lines.join('\n') }
  } catch (error) {
    return { location, text: `天气查询失败：${errorMessage(error)}` }
  }
}

/** Build the registry-ready tool definition. The lookup argument is a test seam. */
export function createWeatherTool(config, lookup = getWeatherText) {
  return {
    name: 'get_weather',
    description: '查询指定地点的实时天气和未来三天预报。不传 location 时查询已配置的默认城市。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        location: {
          type: 'string',
          description: '城市名（如“示例城市”）、经纬度或 QWeather LocationID；缺省时使用配置的默认地点。',
        },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['location', 'text'],
        properties: {
          location: { type: 'string' },
          text: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.text }],
      presentationMeta: (_args, value) => ({ location: value.location }),
    },
    async execute(args) {
      if (args === null || typeof args !== 'object' || Array.isArray(args)) {
        throw new TypeError('get_weather arguments must be an object')
      }
      const location = typeof args.location === 'string' && args.location.trim() !== ''
        ? args.location.trim()
        : config.defaultLocation
      return lookup(config, location)
    },
  }
}

/** Register `get_weather` for the lifetime of this plugin fiber. */
export function apply(ctx, rawConfig) {
  const config = resolveConfig(rawConfig)
  ctx.effect(() => ctx.tools.register(createWeatherTool(config)))
}
