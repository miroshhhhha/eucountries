import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { isAvailable } from '../data/countries'
import { ALL_COUNTRIES } from '../data/allCountries'
import CountryPageLayout from '../components/CountryPage'

export default function CountryPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const upper = code?.toUpperCase() ?? ''

  if (!isAvailable(upper) || !ALL_COUNTRIES[upper]) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          ← Back to map
        </button>
        <CountryPageLayout data={ALL_COUNTRIES[upper]} />
      </div>
    </div>
  )
}
