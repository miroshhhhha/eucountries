// Registry of countries that have data available.
// Add a new entry here after running the extraction script for a new country.
export const AVAILABLE_COUNTRIES = {
  PT: { name: 'Portugal' },
  HU: { name: 'Hungary'  },
  ES: { name: 'Spain'    },
  IT: { name: 'Italy'    },
  AT: { name: 'Austria'  },
}

export function isAvailable(code) {
  return code in AVAILABLE_COUNTRIES
}

// Returns Apple-style emoji flag image from emoji-datasource-apple CDN.
export function appleFlagUrl(code) {
  const codepoints = code
    .toUpperCase()
    .split('')
    .map(c => (c.charCodeAt(0) + 127397).toString(16))
    .join('-')
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${codepoints}.png`
}
