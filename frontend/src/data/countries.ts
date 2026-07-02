export interface CountryMeta {
  name: string
}

export const AVAILABLE_COUNTRIES: Record<string, CountryMeta> = {
  AT: { name: 'Austria' },
  BE: { name: 'Belgium' },
  BG: { name: 'Bulgaria' },
  CY: { name: 'Cyprus' },
  CZ: { name: 'Czech Republic' },
  DE: { name: 'Germany' },
  DK: { name: 'Denmark' },
  EE: { name: 'Estonia' },
  FI: { name: 'Finland' },
  FR: { name: 'France' },
  GR: { name: 'Greece' },
  HR: { name: 'Croatia' },
  HU: { name: 'Hungary' },
  IE: { name: 'Ireland' },
  IT: { name: 'Italy' },
  LT: { name: 'Lithuania' },
  LU: { name: 'Luxembourg' },
  LV: { name: 'Latvia' },
  MT: { name: 'Malta' },
  NL: { name: 'Netherlands' },
  PL: { name: 'Poland' },
  PT: { name: 'Portugal' },
  RO: { name: 'Romania' },
  SE: { name: 'Sweden' },
  SI: { name: 'Slovenia' },
  SK: { name: 'Slovakia' },
  ES: { name: 'Spain' },
}

export function isAvailable(code: string): boolean {
  return code in AVAILABLE_COUNTRIES
}

export function appleFlagUrl(code: string): string {
  const codepoints = code
    .toUpperCase()
    .split('')
    .map(c => (c.charCodeAt(0) + 127397).toString(16))
    .join('-')
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${codepoints}.png`
}
