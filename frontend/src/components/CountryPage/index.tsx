import type { CountryData } from '../../types/country'
import CountryHero from './CountryHero'
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
  return (
    <main className="space-y-5">
      <CountryHero
        country={data.country}
        countryCode={data.country_code}
        currency={data.currency}
        lastUpdated={data.last_updated}
      />

      <Section title="How to Apply" icon="📋">
        <ApplicationStepper
          steps={data.visa.application_process.steps}
          processingTime={data.visa.application_process.processing_time}
          visaTypes={data.visa.types}
        />
      </Section>

      <Section title="Required Documents" icon="✅">
        <DocumentChecklist documents={data.required_documents} />
      </Section>

      <Section title="Financial Requirements" icon="💶">
        <FinancialCalculator requirements={data.financial_requirements} />
      </Section>

      <Section title="Residence Permit After Arrival" icon="🏠">
        <ResidencePermitCard permit={data.residence_permit} />
      </Section>

      <Section title="Working While Studying" icon="💼">
        <WorkRules rules={data.work_while_studying} />
      </Section>

      {data.post_study_work?.available && (
        <Section title="After Graduation" icon="🎓">
          <PostStudyWork postStudy={data.post_study_work} renewal={data.permit_renewal} />
        </Section>
      )}

      <Section title="Tips & Common Mistakes" icon="💡">
        <TipsAccordion tips={data.tips} mistakes={data.common_mistakes} />
      </Section>

      <Section title="Official Sources & Forms" icon="🔗">
        <OfficialLinks sources={data.official_sources} forms={data.application_forms} />
      </Section>
    </main>
  )
}

interface SectionProps {
  title: string
  icon: string
  children: React.ReactNode
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
