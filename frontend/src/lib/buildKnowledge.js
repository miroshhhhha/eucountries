/**
 * Converts full country JSON into a compact text summary.
 * Reduces ~75k tokens → ~5k tokens to fit Groq's free tier (12k TPM).
 */

function summariseCountry(code, d) {
  const lines = []

  lines.push(`## ${d.country} (${code}) — Schengen: ${d.schengen_member ? 'yes' : 'no'} | Currency: ${d.currency ?? '?'}`)

  // Visa
  const vt = d.visa?.types?.[0]
  const pt = d.visa?.application_process?.processing_time
  const fee = d.visa?.application_process?.fee_eur
  const visaParts = []
  if (vt?.code) visaParts.push(`type ${vt.code}`)
  if (fee != null) visaParts.push(`fee €${fee}`)
  if (pt?.typical_min_days != null) visaParts.push(`processing ${pt.typical_min_days}-${pt.typical_max_days} days`)
  if (pt?.recommended_apply_before_start_days != null) visaParts.push(`apply ${pt.recommended_apply_before_start_days} days ahead`)
  if (visaParts.length) lines.push(`Visa: ${visaParts.join(' | ')}`)
  if (vt?.notes) lines.push(`Visa notes: ${vt.notes}`)

  // Financial
  const fin = d.financial_requirements
  if (fin?.reference_value_monthly_eur != null) {
    lines.push(`Financial requirement: €${fin.reference_value_monthly_eur}/month`)
  }

  // Work while studying
  const work = d.work_while_studying
  if (work) {
    if (work.allowed === false) {
      lines.push(`Work: not allowed`)
    } else if (work.allowed === true) {
      const parts = []
      if (work.max_hours_per_week_during_term != null) parts.push(`${work.max_hours_per_week_during_term}h/week during term`)
      if (work.full_time_during_breaks) parts.push(`full-time during breaks`)
      if (work.requires_notification) parts.push(`notification required to ${work.notification_authority ?? 'authorities'}`)
      lines.push(`Work: ${parts.join(', ')}`)
    }
    if (work.restrictions?.length) lines.push(`Work restrictions: ${work.restrictions.join('; ')}`)
  }

  // Residence permit
  const rp = d.residence_permit
  if (rp?.authority_name) {
    const parts = [`authority: ${rp.authority_name}`]
    if (rp.apply_within_days_of_arrival != null) parts.push(`apply within ${rp.apply_within_days_of_arrival} days of arrival`)
    if (rp.validity_months != null) parts.push(`valid ${rp.validity_months} months`)
    if (rp.renewable != null) parts.push(rp.renewable ? 'renewable' : 'not renewable')
    lines.push(`Residence permit: ${parts.join(' | ')}`)
  }

  // Post-study work
  const psw = d.post_study_work
  if (psw) {
    if (psw.available === false) {
      lines.push(`Post-study work: not available`)
    } else if (psw.available === true) {
      const parts = []
      if (psw.job_seeking_permit_months != null) parts.push(`${psw.job_seeking_permit_months} months job-seeking permit`)
      if (psw.legal_basis) parts.push(psw.legal_basis)
      lines.push(`Post-study work: ${parts.join(' | ')}`)
    }
  }

  // Mandatory documents
  const mandatoryDocs = (d.required_documents ?? [])
    .filter(doc => doc.mandatory && doc.name)
    .map(doc => doc.apostille_required ? `${doc.name} (apostille)` : doc.name)
    .slice(0, 8)
  if (mandatoryDocs.length) lines.push(`Mandatory documents: ${mandatoryDocs.join(', ')}`)

  // High-priority tips
  const tips = (d.tips ?? [])
    .filter(t => t.priority === 'high' && t.title)
    .map(t => t.title)
    .slice(0, 3)
  if (tips.length) lines.push(`Key tips: ${tips.join(' | ')}`)

  // Common mistakes
  const mistakes = (d.common_mistakes ?? [])
    .filter(m => m.mistake)
    .map(m => m.mistake)
    .slice(0, 2)
  if (mistakes.length) lines.push(`Common mistakes: ${mistakes.join(' | ')}`)

  return lines.join('\n')
}

export function buildSystemPrompt(allCountries) {
  const summaries = Object.entries(allCountries)
    .map(([code, data]) => summariseCountry(code, data))
    .join('\n\n')

  return `You are a helpful assistant for the EU Study Guide — a platform for non-EU students planning to study in European Union countries.

Answer questions based on the country data below. Be concise and cite specific numbers.

${summaries}

Rules:
- Answer in the same language the user writes in
- Cite exact figures (euros, hours, days) from the data
- If a value is missing for a country, say so honestly
- Do not invent information not in the data
- Use markdown formatting: **bold** for key terms, bullet lists (- item) for multiple items, numbered lists for steps`
}
