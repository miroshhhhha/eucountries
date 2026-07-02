import type { CountryData } from '../types/country'

import AT from './AT.json'
import BE from './BE.json'
import BG from './BG.json'
import CY from './CY.json'
import CZ from './CZ.json'
import DE from './DE.json'
import DK from './DK.json'
import EE from './EE.json'
import FI from './FI.json'
import FR from './FR.json'
import GR from './GR.json'
import HR from './HR.json'
import HU from './HU.json'
import IE from './IE.json'
import IT from './IT.json'
import LT from './LT.json'
import LU from './LU.json'
import LV from './LV.json'
import MT from './MT.json'
import NL from './NL.json'
import PL from './PL.json'
import PT from './PT.json'
import RO from './RO.json'
import SE from './SE.json'
import SI from './SI.json'
import SK from './SK.json'
import ES from './ES.json'

export const ALL_COUNTRIES: Record<string, CountryData> = {
  AT, BE, BG, CY, CZ, DE, DK, EE, FI, FR, GR, HR, HU, IE, IT,
  LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK, ES,
} as unknown as Record<string, CountryData>
