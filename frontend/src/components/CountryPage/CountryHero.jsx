export default function CountryHero({ country, countryCode, currency, lastUpdated }) {
  return (
    <div className="flex items-start justify-between border-b pb-6">
      <div className="flex items-center gap-4">
        <span className="text-6xl" role="img" aria-label={country}>
          {countryCodeToFlag(countryCode)}
        </span>
        <div>
          <h1 className="text-3xl font-bold">{country}</h1>
          {currency && (
            <p className="text-sm text-gray-500 mt-1">
              Currency: <span className="font-medium text-gray-700">{currency}</span>
            </p>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Updated {new Date(lastUpdated).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}

function countryCodeToFlag(code) {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}
