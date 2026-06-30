import { useEffect, useState } from 'react'

export default function Tooltip({ name, code, hasData, x, y }) {
  // Keep tooltip inside the viewport
  const [pos, setPos] = useState({ x, y })

  useEffect(() => {
    setPos({ x, y })
  }, [x, y])

  return (
    <div
      className="pointer-events-none fixed z-50 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
                 bg-white border border-gray-200 whitespace-nowrap"
      style={{ left: pos.x + 12, top: pos.y - 40 }}
    >
      <span className="mr-1">{flagEmoji(code)}</span>
      {name}
      {hasData ? (
        <span className="ml-2 text-xs text-indigo-600 font-normal">Click to open →</span>
      ) : (
        <span className="ml-2 text-xs text-gray-400 font-normal">Coming soon</span>
      )}
    </div>
  )
}

function flagEmoji(code) {
  if (!code) return ''
  return code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')
}
