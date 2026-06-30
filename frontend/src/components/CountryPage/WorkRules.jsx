export default function WorkRules({ rules }) {
  if (!rules) return null;

  const items = [
    rules.allowed !== null && {
      icon: rules.allowed ? "✅" : "❌",
      label: rules.allowed ? "Working while studying is allowed" : "Working while studying is NOT allowed",
      highlight: true,
    },
    rules.max_hours_per_week_during_term && {
      icon: "⏱",
      label: `Max ${rules.max_hours_per_week_during_term} hours/week during term`,
    },
    rules.full_time_during_breaks && {
      icon: "🌞",
      label: "Full-time work allowed during holidays and academic breaks",
    },
    rules.requires_notification && {
      icon: "📬",
      label: `Must notify ${rules.notification_authority || "authorities"} before starting work`,
    },
    rules.legal_basis && {
      icon: "⚖️",
      label: `Legal basis: ${rules.legal_basis}`,
      muted: true,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-lg border
            ${item.highlight ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className={`text-sm ${item.muted ? "text-gray-400" : "text-gray-700"} ${item.highlight ? "font-semibold" : ""}`}>
            {item.label}
          </span>
        </div>
      ))}

      {rules.restrictions?.map((r, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-orange-100 bg-orange-50">
          <span className="text-lg">⚠️</span>
          <span className="text-sm text-orange-800">{r}</span>
        </div>
      ))}

      {rules.notes && (
        <p className="text-xs text-gray-500 italic">{rules.notes}</p>
      )}
    </div>
  );
}
