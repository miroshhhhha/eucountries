import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { isAvailable } from '../data/countries'
import type { CountryData } from '../types/country'

import AT from '../data/AT.json'
import BE from '../data/BE.json'
import BG from '../data/BG.json'
import CY from '../data/CY.json'
import CZ from '../data/CZ.json'
import DE from '../data/DE.json'
import DK from '../data/DK.json'
import EE from '../data/EE.json'
import FI from '../data/FI.json'
import FR from '../data/FR.json'
import GR from '../data/GR.json'
import HR from '../data/HR.json'
import HU from '../data/HU.json'
import IE from '../data/IE.json'
import IT from '../data/IT.json'
import LT from '../data/LT.json'
import LU from '../data/LU.json'
import LV from '../data/LV.json'
import MT from '../data/MT.json'
import NL from '../data/NL.json'
import PL from '../data/PL.json'
import PT from '../data/PT.json'
import RO from '../data/RO.json'
import SE from '../data/SE.json'
import SI from '../data/SI.json'
import SK from '../data/SK.json'
import ES from '../data/ES.json'

import CountryPageLayout from '../components/CountryPage'

const DATA: Record<string, CountryData> = {
  AT, BE, BG, CY, CZ, DE, DK, EE, FI, FR, GR, HR, HU, IE, IT,
  LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK, ES,
} as unknown as Record<string, CountryData>

export default function CountryPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const upper = code?.toUpperCase() ?? ''

  if (!isAvailable(upper) || !DATA[upper]) {
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
        <CountryPageLayout data={DATA[upper]} />
      </div>
    </div>
  )
}
