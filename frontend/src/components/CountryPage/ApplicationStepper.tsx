import type { ApplicationStep, ProcessingTime, VisaType } from '../../types/country'

interface Props {
  steps: ApplicationStep[]
  processingTime: ProcessingTime
  visaTypes: VisaType[]
}

export default function ApplicationStepper({ steps, processingTime, visaTypes }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {visaTypes.map((vt, i) => (
          <div key={vt.code ?? i} className="border rounded-lg px-4 py-2 text-sm">
            <span className="font-mono font-bold text-indigo-600">{vt.code}</span>
            {' · '}
            {vt.name}
            {vt.validity_days && (
              <span className="text-gray-500"> · {vt.validity_days} days</span>
            )}
          </div>
        ))}
      </div>

      <ol className="relative border-l border-gray-200 space-y-8 ml-3">
        {steps.map((s, i) => (
          <li key={s.step ?? i} className="ml-7">
            <span className="absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white text-indigo-700 text-xs font-bold">
              {s.step}
            </span>
            <p className="font-semibold text-sm text-gray-900">{s.title}</p>
            {s.description && (
              <p className="text-sm text-gray-600 mt-1">{s.description}</p>
            )}
            {s.action_required && (
              <p className="text-xs text-indigo-600 mt-1.5">→ {s.action_required}</p>
            )}
          </li>
        ))}
      </ol>

      {processingTime && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-amber-800 mb-1">Processing Time</p>
          <ul className="text-amber-700 space-y-0.5">
            {processingTime.legal_deadline_days && (
              <li>Legal deadline: <strong>{processingTime.legal_deadline_days} days</strong></li>
            )}
            {processingTime.typical_min_days && (
              <li>
                Typical: <strong>{processingTime.typical_min_days}–{processingTime.typical_max_days} days</strong>
              </li>
            )}
            {processingTime.recommended_apply_before_start_days && (
              <li>
                Apply at least <strong>{processingTime.recommended_apply_before_start_days} days</strong> before course starts
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
