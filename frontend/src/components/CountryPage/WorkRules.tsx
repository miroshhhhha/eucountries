import type { WorkWhileStudying } from '../../types/country'

interface Props {
  rules: WorkWhileStudying | null
}

export default function WorkRules({ rules }: Props) {
  if (!rules) return null

  interface Item { icon: string; label: string; highlight?: boolean; muted?: boolean }

  const items: Item[] = []
  if (rules.allowed !== null) {
    items.push({ icon: rules.allowed ? '✅' : '❌', label: rules.allowed ? 'Working while studying is allowed' : 'Working while studying is NOT allowed', highlight: true })
  }
  if (rules.max_hours_per_week_during_term) {
    items.push({ icon: '⏱', label: `Max ${rules.max_hours_per_week_during_term} hours/week during term` })
  }
  if (rules.full_time_during_breaks) {
    items.push({ icon: '🌞', label: 'Full-time work allowed during holidays and academic breaks' })
  }
  if (rules.requires_notification) {
    items.push({ icon: '📬', label: `Must notify ${rules.notification_authority ?? 'authorities'} before starting work` })
  }
  if (rules.legal_basis) {
    items.push({ icon: '⚖️', label: `Legal basis: ${rules.legal_basis}`, muted: true })
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-start gap-3.5 p-4 rounded-xl border
            ${item.highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className={`text-sm ${item.muted ? 'text-gray-400' : 'text-gray-700'} ${item.highlight ? 'font-semibold' : ''}`}>
            {item.label}
          </span>
        </div>
      ))}

      {rules.restrictions?.map((r, i) => (
        <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl border border-orange-100 bg-orange-50">
          <span className="text-lg">⚠️</span>
          <span className="text-sm text-orange-800">{r}</span>
        </div>
      ))}

      {rules.notes && (
        <p className="text-xs text-gray-500 italic">{rules.notes}</p>
      )}
    </div>
  )
}
