import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { EU_ALPHA3, ALPHA3_TO_2 } from './euCountries'
import { isAvailable, AVAILABLE_COUNTRIES } from '../../data/countries'
import Tooltip from './Tooltip'

const GEO_URL = '/countries.geojson'

const COLORS = {
  available:      '#4f46e5',
  availableHover: '#3730a3',
  eu:             '#c7d2fe',
  euHover:        '#a5b4fc',
  other:          '#e5e7eb',
  otherHover:     '#d1d5db',
} as const

interface TooltipState {
  name: string
  code: string
  hasData: boolean
  x: number
  y: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getA3(geo: any): string {
  return geo.properties['ADM0_A3'] as string
}

export default function EUMap() {
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  return (
    <div className="relative w-full select-none">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{ rotate: [-15, -52, 0], scale: 900 }}
        width={800}
        height={500}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const a3 = getA3(geo)
              const isEU = EU_ALPHA3.has(a3)
              const a2 = ALPHA3_TO_2[a3]
              const hasData = isEU && isAvailable(a2)

              const baseColor = hasData ? COLORS.available : isEU ? COLORS.eu : COLORS.other
              const hoverColor = hasData ? COLORS.availableHover : isEU ? COLORS.euHover : COLORS.otherHover

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={baseColor}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none', cursor: hasData ? 'pointer' : 'default' },
                    hover:   { fill: hoverColor, outline: 'none', cursor: hasData ? 'pointer' : 'default' },
                    pressed: { fill: hoverColor, outline: 'none' },
                  }}
                  onMouseMove={(evt: any) => {
                    if (!isEU) return
                    const name = AVAILABLE_COUNTRIES[a2]?.name ?? geo.properties.name
                    setTooltip({ name, code: a2, hasData, x: evt.clientX, y: evt.clientY })
                  }}
                  onMouseLeave={() => { if (isEU) setTooltip(null) }}
                  onClick={() => { if (hasData) navigate(`/country/${a2}`) }}
                />
              )
            })
          }
        </Geographies>

        <MaltaMarker navigate={navigate} setTooltip={setTooltip} />
      </ComposableMap>

      {tooltip && <Tooltip {...tooltip} />}

      <div className="flex items-center gap-6 mt-3 justify-center text-sm text-gray-500">
        <LegendItem color={COLORS.available} label="Guide available — click to open" />
        <LegendItem color={COLORS.eu}        label="EU member — coming soon" />
      </div>
    </div>
  )
}

interface MaltaMarkerProps {
  navigate: (path: string) => void
  setTooltip: (t: TooltipState | null) => void
}

function MaltaMarker({ navigate, setTooltip }: MaltaMarkerProps) {
  const hasData = isAvailable('MT')
  const fill = hasData ? COLORS.available : COLORS.eu
  const fillHover = hasData ? COLORS.availableHover : COLORS.euHover

  return (
    <Marker coordinates={[14.5147, 35.8997]}>
      <circle
        r={8}
        fill={fill}
        stroke="#fff"
        strokeWidth={1.5}
        style={{ cursor: hasData ? 'pointer' : 'default', transition: 'fill 0.15s' }}
        onMouseOver={(e) => { (e.target as SVGCircleElement).setAttribute('fill', fillHover) }}
        onMouseOut={(e) => { (e.target as SVGCircleElement).setAttribute('fill', fill) }}
        onMouseMove={(evt) => setTooltip({ name: 'Malta', code: 'MT', hasData, x: evt.clientX, y: evt.clientY })}
        onMouseLeave={() => setTooltip(null)}
        onClick={() => hasData && navigate('/country/MT')}
      />
    </Marker>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: color }} />
      {label}
    </div>
  )
}
