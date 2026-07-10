import { useState, useMemo, useTransition, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EUMap from '../components/EUMap'
import { AVAILABLE_COUNTRIES, appleFlagUrl } from '../data/countries'
import { ALL_COUNTRIES } from '../data/allCountries'
import type { CountryData } from '../types/country'

interface Filters {
  schengen: boolean | null
  workAllowed: boolean | null
  minWorkHours: number | null
  maxFinancial: number | null
  jobPermit: boolean | null
}

const EMPTY_FILTERS: Filters = {
  schengen: null,
  workAllowed: null,
  minWorkHours: null,
  maxFinancial: null,
  jobPermit: null,
}

function matchesFilters(data: CountryData, f: Filters): boolean {
  if (f.schengen !== null && data.schengen_member !== f.schengen) return false
  if (f.workAllowed !== null && data.work_while_studying?.allowed !== f.workAllowed) return false
  if (f.minWorkHours !== null) {
    const hrs = data.work_while_studying?.max_hours_per_week_during_term ?? 0
    if (!hrs || hrs < f.minWorkHours) return false
  }
  if (f.maxFinancial !== null) {
    const eur = data.financial_requirements?.reference_value_monthly_eur
    // if EUR value unknown, don't exclude — user can check details manually
    if (eur !== null && eur !== undefined && eur > f.maxFinancial) return false
  }
  return !(f.jobPermit !== null && data.post_study_work?.available !== f.jobPermit);

}

function isActive(f: Filters): boolean {
  return Object.values(f).some(v => v !== null)
}

export default function Home() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [, startTransition] = useTransition()

  const highlightedCodes = useMemo<Set<string> | null>(() => {
    if (!isActive(filters)) return null
    const codes = new Set<string>()
    for (const [code, data] of Object.entries(ALL_COUNTRIES)) {
      if (matchesFilters(data, filters)) codes.add(code)
    }
    return codes
  }, [filters])

  const toggle = <K extends keyof Filters>(key: K, value: NonNullable<Filters[K]>) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }))
  }

  const setSelect = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    startTransition(() => setFilters(prev => ({ ...prev, [key]: value })))
  }

  const matchCount = highlightedCodes?.size ?? Object.keys(AVAILABLE_COUNTRIES).length
  const filtersOn = isActive(filters)

  const available = Object.entries(AVAILABLE_COUNTRIES)
  const visibleCodes = filtersOn && highlightedCodes
    ? available.filter(([code]) => highlightedCodes.has(code))
    : available

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">EU Study Guide</h1>
            <p className="text-lg text-gray-500">
              Step-by-step visa guides, document checklists, and financial calculators
              for non-EU students. Click a country to get started.
            </p>
          </div>
          <img
            src="/Techno_TLN_Logo.svg"
            alt="Techno TLN"
            className="w-64 max-w-full flex-shrink-0"
          />
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Filter</span>

          <FilterPill
            label="Schengen"
            active={filters.schengen === true}
            onClick={() => toggle('schengen', true)}
          />
          <FilterPill
            label="Work allowed"
            active={filters.workAllowed === true}
            onClick={() => toggle('workAllowed', true)}
          />
          <FilterPill
            label="≥ 20h/week"
            active={filters.minWorkHours === 20}
            onClick={() => toggle('minWorkHours', 20)}
          />

          <BudgetInput
            value={filters.maxFinancial}
            onChange={v => setSelect('maxFinancial', v)}
          />

          <FilterPill
            label="Job permit"
            active={filters.jobPermit === true}
            onClick={() => toggle('jobPermit', true)}
          />

          {filtersOn && (
            <>
              <span className="text-sm text-indigo-600 font-medium ml-1">
                {matchCount} {matchCount === 1 ? 'country' : 'countries'}
              </span>
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <EUMap highlightedCodes={highlightedCodes} />
        </div>

        {/* Country grid */}
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {filtersOn ? `Matching countries (${matchCount})` : 'Guides available now'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleCodes.map(([code, { name }]) => (
              <CountryCard
                key={code}
                code={code}
                name={name}
                onClick={() => navigate(`/country/${code}`)}
              />
            ))}
            {filtersOn && matchCount === 0 && (
              <p className="col-span-full text-sm text-gray-400 py-4">
                No countries match these filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const COUNTRY_PHOTO_EXT: Record<string, string> = { NL: 'png', ES: 'jpeg' }

function countryPhotoUrl(code: string): string {
  const ext = COUNTRY_PHOTO_EXT[code] ?? 'jpg'
  return `/images/countries/${code}.${ext}`
}

const CARD_GRADIENTS = [
  'from-indigo-500 to-blue-700',
  'from-violet-500 to-purple-700',
  'from-sky-500 to-cyan-700',
  'from-teal-500 to-emerald-700',
]

function cardGradient(code: string): string {
  const idx = (code.charCodeAt(0) + code.charCodeAt(1)) % CARD_GRADIENTS.length
  return CARD_GRADIENTS[idx]
}

function CountryCard({ code, name, onClick }: { code: string; name: string; onClick: () => void }) {
  const data = ALL_COUNTRIES[code as keyof typeof ALL_COUNTRIES]
  const financial = data?.financial_requirements?.reference_value_monthly_eur
  const workAllowed = data?.work_while_studying?.allowed
  const workHours = workAllowed ? data?.work_while_studying?.max_hours_per_week_during_term : null
  const postStudyMonths = data?.post_study_work?.available
    ? data?.post_study_work?.job_seeking_permit_months
    : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group aspect-[3/2]
                  bg-gradient-to-br ${cardGradient(code)}`}
    >
      <img
        src={countryPhotoUrl(code)}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* hover shimmer */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-200" />

      {/* bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <img src={appleFlagUrl(code)} alt="" className="h-5 w-auto flex-shrink-0 drop-shadow" />
          <span className="text-white font-semibold text-sm leading-tight drop-shadow">{name}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {financial != null && (
            <span className="text-[11px] text-white/90 bg-black/35 backdrop-blur-sm rounded-full px-2 py-0.5">
              €{Math.round(financial)}/mo
            </span>
          )}
          {workHours != null && (
            <span className="text-[11px] text-white/90 bg-black/35 backdrop-blur-sm rounded-full px-2 py-0.5">
              {workHours}h/wk work
            </span>
          )}
          {postStudyMonths != null && (
            <span className="text-[11px] text-white/90 bg-black/35 backdrop-blur-sm rounded-full px-2 py-0.5">
              {postStudyMonths}mo job search
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border
        ${active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
        }`}
    >
      {active && <span className="mr-1">✓</span>}
      {label}
    </button>
  )
}

const BUDGET_MIN = 300
const BUDGET_MAX = 1500
const BUDGET_STEP = 50

function BudgetInput({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [local, setLocal] = useState<number>(value ?? BUDGET_MAX)
  const active = local < BUDGET_MAX
  const pct = ((local - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100

  // sync when parent resets (e.g. "Clear all")
  useEffect(() => { if (value === null) setLocal(BUDGET_MAX) }, [value])

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors
      ${active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
    >
      <span className={`whitespace-nowrap ${active ? 'text-white' : 'text-gray-500'}`}>
        {active ? `Required ≤ €${local}/mo` : 'Required funds'}
      </span>
      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={BUDGET_STEP}
        value={local}
        onChange={e => {
          const v = Number(e.target.value)
          setLocal(v)
          onChange(v >= BUDGET_MAX ? null : v)
        }}
        className={`budget-slider w-24 h-1.5 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          ${active ? 'active' : ''}`}
        style={{
          background: active
            ? `linear-gradient(to right, rgba(255,255,255,0.85) ${pct}%, rgba(255,255,255,0.25) ${pct}%)`
            : `linear-gradient(to right, #6366f1 ${pct}%, #e5e7eb ${pct}%)`,
        }}
      />
      {active && (
        <button onClick={() => { setLocal(BUDGET_MAX); onChange(null) }} className="text-white/70 hover:text-white leading-none">×</button>
      )}
    </div>
  )
}
