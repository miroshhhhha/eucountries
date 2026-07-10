import type { OfficialSource, ApplicationForm } from '../../types/country'

interface Props {
  sources: OfficialSource[]
  forms: ApplicationForm[]
}

export default function OfficialLinks({ sources, forms }: Props) {
  return (
    <div className="space-y-5">
      {sources?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Official Information</p>
          <div className="space-y-2">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
              >
                <span className="text-gray-400 group-hover:text-indigo-500 mt-0.5">🔗</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{s.url}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {forms?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Application Forms</p>
          <div className="space-y-2">
            {forms.map((f, i) => {
              const hasUrl = !!f.url
              const icon = f.type === 'pdf' ? '📥' : f.type === 'online' ? '📋' : f.type === 'image' ? '🖼️' : '📄'
              const badge =
                f.type === 'pdf' ? 'PDF' :
                f.type === 'online' ? 'Online' :
                f.type === 'image' ? 'Preview' :
                null

              const content = (
                <>
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${hasUrl ? 'text-gray-800 group-hover:text-green-700' : 'text-gray-400'}`}>{f.name}</p>
                    {f.authority && <p className="text-xs text-gray-400 truncate">{f.authority}</p>}
                  </div>
                  <div className="ml-auto flex-shrink-0 flex items-center gap-2">
                    {badge && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        f.type === 'pdf' ? 'bg-red-50 text-red-600' :
                        f.type === 'online' ? 'bg-blue-50 text-blue-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>{badge}</span>
                    )}
                    {hasUrl
                      ? <span className="text-xs text-gray-400 group-hover:text-green-600">Open →</span>
                      : <span className="text-xs text-gray-300">Unavailable</span>
                    }
                  </div>
                </>
              )

              return hasUrl ? (
                <a
                  key={i}
                  href={f.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50 cursor-not-allowed"
                >
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
