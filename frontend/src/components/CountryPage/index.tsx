import type { CountryData } from '../../types/country'
import { FLAG_COLORS } from '../../utils/flagColors'
import CountryHero from './CountryHero'
import CountryGallery from './CountryGallery'
import ApplicationStepper from './ApplicationStepper'
import DocumentChecklist from './DocumentChecklist'
import FinancialCalculator from './FinancialCalculator'
import WorkRules from './WorkRules'
import ResidencePermitCard from './ResidencePermitCard'
import PostStudyWork from './PostStudyWork'
import TipsAccordion from './TipsAccordion'
import OfficialLinks from './OfficialLinks'

interface Props {
  data: CountryData
}

export default function CountryPage({ data }: Props) {
  const flagColors = data.country_code ? (FLAG_COLORS[data.country_code] ?? []) : []

  return (
    <main className="space-y-5">
      <CountryHero
        country={data.country}
        countryCode={data.country_code}
        currency={data.currency}
        lastUpdated={data.last_updated}
      />

      {data.country_code && data.country && (
        <Section title="Gallery" icon="🖼️" flagColors={flagColors}>
          <CountryGallery countryCode={data.country_code} countryName={data.country} />
        </Section>
      )}

      <Section title="How to Apply" icon="📋" flagColors={flagColors}>
        <ApplicationStepper
          steps={data.visa.application_process.steps}
          processingTime={data.visa.application_process.processing_time}
          visaTypes={data.visa.types}
        />
      </Section>

      <Section title="Required Documents" icon="✅" flagColors={flagColors}>
        <DocumentChecklist documents={data.required_documents} />
      </Section>

      <Section title="Financial Requirements" icon="💶" flagColors={flagColors}>
        <FinancialCalculator requirements={data.financial_requirements} />
      </Section>

      <Section title="Residence Permit After Arrival" icon="🏠" flagColors={flagColors}>
        <ResidencePermitCard permit={data.residence_permit} />
      </Section>

      <Section title="Working While Studying" icon="💼" flagColors={flagColors}>
        <WorkRules rules={data.work_while_studying} />
      </Section>

      {data.post_study_work?.available && (
        <Section title="After Graduation" icon="🎓" flagColors={flagColors}>
          <PostStudyWork postStudy={data.post_study_work} renewal={data.permit_renewal} />
        </Section>
      )}

      <Section title="Tips & Common Mistakes" icon="💡" flagColors={flagColors}>
        <TipsAccordion tips={data.tips} mistakes={data.common_mistakes} />
      </Section>

      <Section title="Official Sources & Forms" icon="🔗" flagColors={flagColors}>
        <OfficialLinks sources={data.official_sources} forms={data.application_forms} />
      </Section>
    </main>
  )
}

interface SectionProps {
  title: string
  icon: string
  children: React.ReactNode
  flagColors?: string[]
}

function Section({ title, icon, children, flagColors = [] }: SectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {flagColors.length > 0 && (
        <div className="relative flex h-[5px] gap-[1px] bg-gray-200">
          {flagColors.map((color, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: color }} />
          ))}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.06]" />
        </div>
      )}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="text-xl leading-none">{icon}</span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-6">
        {children}
      </div>
    </section>
  )
}
