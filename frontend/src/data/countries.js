// Registry of countries that have data available.
// Add a new entry here after running the extraction script for a new country.
export const AVAILABLE_COUNTRIES = {
  PT: { name: 'Portugal', flag: '🇵🇹' },
  IT: { name: 'Italy',    flag: '🇮🇹' },
  AT: { name: 'Austria',  flag: '🇦🇹' },
}

export function isAvailable(code) {
  return code in AVAILABLE_COUNTRIES
}
