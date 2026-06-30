// ISO alpha-3 codes of all 27 EU member states (used by react-simple-maps GeoJSON)
export const EU_ALPHA3 = new Set([
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST',
  'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA',
  'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK',
  'SVN', 'ESP', 'SWE',
])

// Map alpha-3 → alpha-2 for routing
export const ALPHA3_TO_2 = {
  AUT:'AT', BEL:'BE', BGR:'BG', HRV:'HR', CYP:'CY', CZE:'CZ',
  DNK:'DK', EST:'EE', FIN:'FI', FRA:'FR', DEU:'DE', GRC:'GR',
  HUN:'HU', IRL:'IE', ITA:'IT', LVA:'LV', LTU:'LT', LUX:'LU',
  MLT:'MT', NLD:'NL', POL:'PL', PRT:'PT', ROU:'RO', SVK:'SK',
  SVN:'SI', ESP:'ES', SWE:'SE',
}
