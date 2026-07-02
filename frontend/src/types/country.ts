export interface VisaType {
  code: string | null
  name: string | null
  validity_days: number | null
  entries: number | null
  for_stays_over_days: number | null
  notes: string | null
}

export interface ApplicationStep {
  step: number | null
  title: string | null
  description: string | null
  action_required: string | null
}

export interface ProcessingTime {
  legal_deadline_days: number | null
  typical_min_days: number | null
  typical_max_days: number | null
  recommended_apply_before_start_days: number | null
}

export interface BookingMethod {
  method: string | null
  description: string | null
  url: string | null
}

export interface Visa {
  types: VisaType[]
  application_process: {
    booking_methods: BookingMethod[]
    steps: ApplicationStep[]
    processing_time: ProcessingTime
    fee_eur: number | null
    interview_required: boolean | null
  }
}

export interface Document {
  id: string | null
  name: string | null
  details: string | null
  mandatory: boolean | null
  apostille_required: boolean | null
  exemptions: string[]
  notes: string | null
}

export interface FinancialRequirements {
  reference_value_monthly_eur: number | null
  reference_basis: string | null
  year: number | null
  calculation_rules: {
    first_adult_pct: number | null
    additional_adult_pct: number | null
    dependent_child_pct: number | null
  }
  example_12_months_eur: number | null
  acceptable_proof: string[]
  exemptions: string[]
}

export interface ResidencePermit {
  authority_name: string | null
  authority_full_name: string | null
  authority_url: string | null
  apply_within_days_of_arrival: number | null
  validity_months: number | null
  renewable: boolean | null
  booking_method: string | null
  required_documents: string[]
  notes: string | null
}

export interface WorkWhileStudying {
  allowed: boolean | null
  max_hours_per_week_during_term: number | null
  full_time_during_breaks: boolean | null
  requires_notification: boolean | null
  notification_authority: string | null
  legal_basis: string | null
  restrictions: string[]
  notes: string | null
}

export interface PermitRenewal {
  apply_before_expiry_min_days: number | null
  apply_before_expiry_max_days: number | null
  online_portal: string | null
  required_documents: string[]
  notes: string | null
}

export interface PostStudyWork {
  available: boolean | null
  job_seeking_permit_months: number | null
  legal_basis: string | null
  process_authority: string | null
  requirements: string[]
  notes: string | null
}

export interface OfficialSource {
  name: string | null
  url: string | null
  description: string | null
}

export interface ApplicationForm {
  name: string | null
  url: string | null
  authority: string | null
}

export interface Tip {
  title: string | null
  body: string | null
  priority: 'high' | 'medium' | 'low' | null
}

export interface CommonMistake {
  mistake: string | null
  consequence: string | null
  how_to_avoid: string | null
}

export interface CountryData {
  country: string | null
  country_code: string | null
  last_updated: string | null
  schengen_member: boolean | null
  currency: string | null
  official_language: string | null
  qualifying_courses: {
    long_stay: string[]
    short_stay: string[]
    notes: string | null
  }
  visa: Visa
  required_documents: Document[]
  financial_requirements: FinancialRequirements
  residence_permit: ResidencePermit
  work_while_studying: WorkWhileStudying
  permit_renewal: PermitRenewal
  post_study_work: PostStudyWork
  official_sources: OfficialSource[]
  application_forms: ApplicationForm[]
  tips: Tip[]
  common_mistakes: CommonMistake[]
}
