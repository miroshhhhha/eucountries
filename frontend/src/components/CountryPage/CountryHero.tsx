import { appleFlagUrl } from '../../data/countries'

interface Props {
  country: string | null
  countryCode: string | null
  currency: string | null
  lastUpdated: string | null
}

export default function CountryHero({ country, countryCode, currency, lastUpdated }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-5">
        {countryCode && (
          <img
            src={appleFlagUrl(countryCode)}
            alt={country ?? countryCode}
            className="h-10 w-auto"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{country}</h1>
          {currency && (
            <p className="text-sm text-gray-500 mt-1.5">
              Currency: <span className="font-medium text-gray-700">{currency}</span>
            </p>
          )}
        </div>
      </div>
      {lastUpdated && (
        <p className="text-sm text-gray-400 self-start pt-1">
          Updated {new Date(lastUpdated).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}
