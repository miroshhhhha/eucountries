import type { PostStudyWork as PostStudyWorkData, PermitRenewal } from '../../types/country'

interface Props {
  postStudy: PostStudyWorkData
  renewal?: PermitRenewal | null
}

export default function PostStudyWork({ postStudy, renewal }: Props) {
  return (
    <div className="space-y-4">
      {postStudy.job_seeking_permit_months && (
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
          <p className="text-sm font-semibold text-purple-800">
            Job-seeking permit available for {postStudy.job_seeking_permit_months} months after graduation
          </p>
          {postStudy.legal_basis && (
            <p className="text-xs text-purple-500 mt-1">{postStudy.legal_basis}</p>
          )}
        </div>
      )}

      {postStudy.requirements && postStudy.requirements.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Requirements to transition</p>
          <ul className="space-y-1">
            {postStudy.requirements.map((r, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {renewal && (
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600">
          <span className="font-medium">Renew your permit </span>
          {renewal.apply_before_expiry_min_days}–{renewal.apply_before_expiry_max_days} days before expiry
          {renewal.online_portal && ` via ${renewal.online_portal}`}.
        </div>
      )}

      {postStudy.notes && (
        <p className="text-xs text-gray-500 italic">{postStudy.notes}</p>
      )}
    </div>
  )
}
