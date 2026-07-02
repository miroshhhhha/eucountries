import { useState } from 'react'
import type { Tip, CommonMistake } from '../../types/country'

interface Props {
  tips: Tip[]
  mistakes: CommonMistake[]
}

type Tab = 'tips' | 'mistakes'

export default function TipsAccordion({ tips, mistakes }: Props) {
  const [tab, setTab] = useState<Tab>('tips')

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <TabButton active={tab === 'tips'} onClick={() => setTab('tips')}>
          💡 Tips ({tips?.length ?? 0})
        </TabButton>
        <TabButton active={tab === 'mistakes'} onClick={() => setTab('mistakes')}>
          ⚠️ Common Mistakes ({mistakes?.length ?? 0})
        </TabButton>
      </div>

      <div className="space-y-2">
        {tab === 'tips'
          ? (tips ?? []).map((item, i) => (
              <AccordionItem
                key={i}
                title={item.title}
                body={item.body}
                priority={item.priority}
                isMistake={false}
              />
            ))
          : (mistakes ?? []).map((item, i) => (
              <AccordionItem
                key={i}
                title={item.mistake}
                body={item.consequence}
                extra={item.how_to_avoid}
                isMistake={true}
              />
            ))
        }
      </div>
    </div>
  )
}

interface AccordionItemProps {
  title: string | null
  body: string | null
  extra?: string | null
  priority?: Tip['priority']
  isMistake: boolean
}

function AccordionItem({ title, body, extra, priority, isMistake }: AccordionItemProps) {
  const [open, setOpen] = useState(false)

  const priorityColors: Record<string, string> = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-gray-200 bg-gray-50',
  }
  const baseClass = isMistake
    ? 'border-orange-200 bg-orange-50'
    : (priority ? priorityColors[priority] : 'border-gray-200 bg-white')

  return (
    <div className={`border rounded-lg overflow-hidden ${baseClass}`}>
      <button
        className="w-full text-left px-4 py-4 flex items-center justify-between gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-medium">{title}</span>
        <span className="text-gray-400 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          {body && <p className="text-sm text-gray-700">{body}</p>}
          {extra && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded p-2">
              <span className="font-medium">How to avoid: </span>{extra}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  )
}
