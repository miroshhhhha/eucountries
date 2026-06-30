export default function ResidencePermitCard({ permit }) {
  if (!permit) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Authority"
          value={permit.authority_name}
          sub={permit.authority_full_name}
        />
        {permit.apply_within_days_of_arrival && (
          <StatCard
            label="Apply within"
            value={`${permit.apply_within_days_of_arrival} days`}
            sub="of arrival"
            accent
          />
        )}
        {permit.validity_months && (
          <StatCard
            label="Permit validity"
            value={`${permit.validity_months} year${permit.validity_months > 12 ? "s" : ""}`}
            sub={permit.renewable ? "renewable" : "non-renewable"}
          />
        )}
      </div>

      {permit.booking_method && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="font-medium">How to book: </span>{permit.booking_method}
        </div>
      )}

      {permit.required_documents?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Documents to bring to AIMA</p>
          <ul className="space-y-1">
            {permit.required_documents.map((doc, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>{doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {permit.notes && (
        <p className="text-xs text-gray-500 italic">{permit.notes}</p>
      )}

      {permit.authority_url && (
        <a
          href={permit.authority_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-indigo-600 hover:underline"
        >
          {permit.authority_name} official website →
        </a>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? "bg-indigo-50 border-indigo-100" : "bg-white border-gray-100"}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${accent ? "text-indigo-700" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
