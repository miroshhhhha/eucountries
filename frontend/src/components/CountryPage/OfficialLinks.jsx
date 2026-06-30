export default function OfficialLinks({ sources, forms }) {
  return (
    <div className="space-y-5">
      {sources?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Official Information</p>
          <div className="space-y-2">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
              >
                <span className="text-gray-400 group-hover:text-indigo-500 mt-0.5">🔗</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">
                    {s.name}
                  </p>
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
            {forms.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-green-700">{f.name}</p>
                  {f.authority && (
                    <p className="text-xs text-gray-400">{f.authority}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-green-600">Download →</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
