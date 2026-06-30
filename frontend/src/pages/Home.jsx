import EUMap from '../components/EUMap'
import { AVAILABLE_COUNTRIES } from '../data/countries'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const available = Object.entries(AVAILABLE_COUNTRIES)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">EU Study Guide</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Step-by-step visa guides, document checklists, and financial calculators
            for non-EU students. Click a country to get started.
          </p>
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <EUMap />
        </div>

        {/* Available country cards */}
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Guides available now
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {available.map(([code, { name, flag }]) => (
              <button
                key={code}
                onClick={() => navigate(`/country/${code}`)}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3
                           hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left group"
              >
                <span className="text-2xl">{flag}</span>
                <span className="font-medium text-gray-800 group-hover:text-indigo-700">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
