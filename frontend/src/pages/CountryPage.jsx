import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { isAvailable } from '../data/countries'

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
import LV from '../data/LV.json'
import NL from '../data/NL.json'
import LU from '../data/LU.json'
import MT from '../data/MT.json'
import PL from '../data/PL.json'
import PT from '../data/PT.json'
import RO from '../data/RO.json'
import SK from '../data/SK.json'
import SI from '../data/SI.json'
import ES from '../data/ES.json'
import SE from '../data/SE.json'

import CountryPageLayout from '../components/CountryPage'

const DATA = { AT, BE, BG, CY, CZ, DE, DK, EE, FI, FR, GR, HR, HU, IE, IT, LT, LV, NL, LU, MT, PL, PT, RO, SK, SI, ES, SE }

export default function CountryPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const upper = code?.toUpperCase()

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
