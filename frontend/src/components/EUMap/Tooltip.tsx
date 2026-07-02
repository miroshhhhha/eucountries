import { useEffect, useState } from 'react'
import { appleFlagUrl } from '../../data/countries'

interface TooltipProps {
  name: string
  code: string
  hasData: boolean
  x: number
  y: number
}

export default function Tooltip({ name, code, hasData, x, y }: TooltipProps) {
  const [pos, setPos] = useState({ x, y })

  useEffect(() => {
    setPos({ x, y })
  }, [x, y])

  return (
    <div
      className="pointer-events-none fixed z-50 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
                 bg-white border border-gray-200 whitespace-nowrap flex items-center gap-2"
      style={{ left: pos.x + 12, top: pos.y - 40 }}
    >
      {code && <img src={appleFlagUrl(code)} alt={code} className="h-4 w-auto" />}
      {name}
      {hasData ? (
        <span className="text-xs text-indigo-600 font-normal">Click to open →</span>
      ) : (
        <span className="text-xs text-gray-400 font-normal">Coming soon</span>
      )}
    </div>
  )
}
