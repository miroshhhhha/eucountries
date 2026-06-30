import CountryHero from "./CountryHero";
import ApplicationStepper from "./ApplicationStepper";
import DocumentChecklist from "./DocumentChecklist";
import FinancialCalculator from "./FinancialCalculator";
import WorkRules from "./WorkRules";
import ResidencePermitCard from "./ResidencePermitCard";
import PostStudyWork from "./PostStudyWork";
import TipsAccordion from "./TipsAccordion";
import OfficialLinks from "./OfficialLinks";

export default function CountryPage({ data }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <CountryHero
        country={data.country}
        countryCode={data.country_code}
        currency={data.currency}
        lastUpdated={data.last_updated}
      />

      {/* SECTION 1: Visa application flow */}
      <Section title="How to Apply" icon="📋">
        <ApplicationStepper
          steps={data.visa.application_process.steps}
          processingTime={data.visa.application_process.processing_time}
          visaTypes={data.visa.types}
        />
      </Section>

      {/* SECTION 2: Documents — interactive checklist */}
      <Section title="Required Documents" icon="✅">
        <DocumentChecklist documents={data.required_documents} />
      </Section>

      {/* SECTION 3: Money — live calculator */}
      <Section title="Financial Requirements" icon="💶">
        <FinancialCalculator requirements={data.financial_requirements} />
      </Section>

      {/* SECTION 4: Residence permit — timeline card */}
      <Section title="Residence Permit After Arrival" icon="🏠">
        <ResidencePermitCard permit={data.residence_permit} />
      </Section>

      {/* SECTION 5: Working rules */}
      <Section title="Working While Studying" icon="💼">
        <WorkRules rules={data.work_while_studying} />
      </Section>

      {/* SECTION 6: Post-study options */}
      {data.post_study_work?.available && (
        <Section title="After Graduation" icon="🎓">
          <PostStudyWork postStudy={data.post_study_work} renewal={data.permit_renewal} />
        </Section>
      )}

      {/* SECTION 7: Tips and common mistakes */}
      <Section title="Tips & Common Mistakes" icon="💡">
        <TipsAccordion tips={data.tips} mistakes={data.common_mistakes} />
      </Section>

      {/* SECTION 8: Official links */}
      <Section title="Official Sources & Forms" icon="🔗">
        <OfficialLinks sources={data.official_sources} forms={data.application_forms} />
      </Section>
    </main>
  );
}

function Section({ title, icon, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
