const MEASUREMENT_SESSION_COOKIE = 'porterful_measurement_session'
const MEASUREMENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const US_STATE_MAP: Record<string, string> = {
  ALABAMA: 'AL',
  ALASKA: 'AK',
  ARIZONA: 'AZ',
  ARKANSAS: 'AR',
  CALIFORNIA: 'CA',
  COLORADO: 'CO',
  CONNECTICUT: 'CT',
  DELAWARE: 'DE',
  FLORIDA: 'FL',
  GEORGIA: 'GA',
  HAWAII: 'HI',
  IDAHO: 'ID',
  ILLINOIS: 'IL',
  INDIANA: 'IN',
  IOWA: 'IA',
  KANSAS: 'KS',
  KENTUCKY: 'KY',
  LOUISIANA: 'LA',
  MAINE: 'ME',
  MARYLAND: 'MD',
  MASSACHUSETTS: 'MA',
  MICHIGAN: 'MI',
  MINNESOTA: 'MN',
  MISSISSIPPI: 'MS',
  MISSOURI: 'MO',
  MONTANA: 'MT',
  NEBRASKA: 'NE',
  NEVADA: 'NV',
  NEW_HAMPSHIRE: 'NH',
  NEW_JERSEY: 'NJ',
  NEW_MEXICO: 'NM',
  NEW_YORK: 'NY',
  NORTH_CAROLINA: 'NC',
  NORTH_DAKOTA: 'ND',
  OHIO: 'OH',
  OKLAHOMA: 'OK',
  OREGON: 'OR',
  PENNSYLVANIA: 'PA',
  RHODE_ISLAND: 'RI',
  SOUTH_CAROLINA: 'SC',
  SOUTH_DAKOTA: 'SD',
  TENNESSEE: 'TN',
  TEXAS: 'TX',
  UTAH: 'UT',
  VERMONT: 'VT',
  VIRGINIA: 'VA',
  WASHINGTON: 'WA',
  WEST_VIRGINIA: 'WV',
  WISCONSIN: 'WI',
  WYOMING: 'WY',
  DISTRICT_OF_COLUMBIA: 'DC',
}

export type MeasurementLocation = {
  city: string | null
  state: string | null
}

export function createMeasurementSessionId(): string {
  const cryptoObj = globalThis.crypto as Crypto | undefined
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID()
  }

  return `ms_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function isUuidLike(value: string | null | undefined): boolean {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function readCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [rawKey, ...rest] = part.split('=')
    if (rawKey?.trim() !== name) continue
    return decodeURIComponent(rest.join('=').trim())
  }
  return null
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function toTitleCase(value: string): string {
  return normalizeWhitespace(value)
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((part) => {
          if (!part) return part
          if (/^[A-Z0-9.]{2,}$/.test(part)) return part
          return part[0].toUpperCase() + part.slice(1).toLowerCase()
        })
        .join('-')
    )
    .join(' ')
}

export function normalizeCity(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = normalizeWhitespace(value)
  if (!cleaned) return null
  return toTitleCase(cleaned).slice(0, 80)
}

export function normalizeState(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = normalizeWhitespace(value)
  if (!cleaned) return null

  const upper = cleaned.toUpperCase().replace(/[^A-Z\s]/g, '')
  if (upper.length === 2) {
    return upper
  }

  const condensed = upper.replace(/\s+/g, '_')
  return US_STATE_MAP[condensed] || US_STATE_MAP[upper.replace(/\s+/g, '_')] || upper.slice(0, 32) || null
}

export function normalizeMeasurementLocation(
  input: { city?: unknown; state?: unknown } | null | undefined
): MeasurementLocation {
  return {
    city: normalizeCity(input?.city ?? null),
    state: normalizeState(input?.state ?? null),
  }
}

export function resolveMeasurementLocation(params: {
  headers?: Headers | HeadersInit | null
  city?: unknown
  state?: unknown
} = {}): MeasurementLocation {
  const headers = params.headers instanceof Headers
    ? params.headers
    : new Headers(params.headers ?? undefined)

  const city =
    params.city ??
    headers.get('x-vercel-ip-city') ??
    headers.get('x-vercel-ip-city-name') ??
    headers.get('cf-ipcity') ??
    headers.get('x-city') ??
    null

  const state =
    params.state ??
    headers.get('x-vercel-ip-country-region-code') ??
    headers.get('x-vercel-ip-country-region') ??
    headers.get('cf-region-code') ??
    headers.get('cf-region') ??
    headers.get('x-state') ??
    null

  return normalizeMeasurementLocation({ city, state })
}

export function ensureMeasurementSessionId(): string {
  if (typeof document === 'undefined') {
    return createMeasurementSessionId()
  }

  const existing = readCookieValue(document.cookie, MEASUREMENT_SESSION_COOKIE)
  if (isUuidLike(existing)) {
    return existing as string
  }

  const sessionId = createMeasurementSessionId()
  document.cookie = [
    `${MEASUREMENT_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    'path=/',
    `max-age=${MEASUREMENT_SESSION_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
  ].join('; ')
  return sessionId
}

export function readMeasurementSessionIdFromCookie(cookieHeader: string | null | undefined): string | null {
  const value = readCookieValue(cookieHeader, MEASUREMENT_SESSION_COOKIE)
  return isUuidLike(value) ? value : null
}

export function getMeasurementSessionCookieName(): string {
  return MEASUREMENT_SESSION_COOKIE
}
