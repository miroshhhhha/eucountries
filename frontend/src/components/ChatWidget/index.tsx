import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RetryState {
  secondsLeft: number
  pendingMessage: string
  pendingHistory: Message[]
  pendingUpdated: Message[]
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryState, setRetryState] = useState<RetryState | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, retryState])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Countdown + auto-retry
  const doRequestRef = useRef(doRequest)
  useEffect(() => { doRequestRef.current = doRequest })

  useEffect(() => {
    if (!retryState) return
    if (retryState.secondsLeft <= 0) {
      const { pendingMessage, pendingHistory, pendingUpdated } = retryState
      setRetryState(null)
      doRequestRef.current(pendingMessage, pendingHistory, pendingUpdated)
      return
    }
    const timer = setTimeout(() => {
      setRetryState(prev => prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null)
    }, 1000)
    return () => clearTimeout(timer)
  }, [retryState])

  async function doRequest(text: string, history: Message[], updated: Message[]) {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-6) }),
      })
      const data = await res.json() as { reply?: string; error?: string; retryAfterMs?: number }

      if (data.retryAfterMs) {
        setRetryState({
          secondsLeft: Math.ceil(data.retryAfterMs / 1000),
          pendingMessage: text,
          pendingHistory: history,
          pendingUpdated: updated,
        })
        setLoading(false)
        return
      }

      const reply = data.reply ?? data.error ?? 'Something went wrong.'
      setMessages([...updated, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Could not reach the server. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  async function send() {
    const text = input.trim()
    if (!text || loading || retryState) return
    const history = [...messages]
    const updated = [...messages, { role: 'user' as const, content: text }]
    setMessages(updated)
    setInput('')
    await doRequest(text, history, updated)
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white font-semibold text-sm">EU Study Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-xl leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && !retryState && (
              <p className="text-sm text-gray-400 text-center mt-10 leading-relaxed">
                Ask me anything about studying in the EU —<br />
                visas, documents, costs, work rules...
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Rate-limit countdown */}
            {retryState && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700">
                  <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Retrying in {retryState.secondsLeft}s...
                </div>
              </div>
            )}

            {/* Thinking dots */}
            {loading && !retryState && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={retryState ? `Retrying in ${retryState.secondsLeft}s...` : 'Ask a question...'}
                disabled={loading || !!retryState}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || !!retryState}
                className="bg-indigo-600 text-white rounded-xl px-3 py-2 text-sm font-medium
                           hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                aria-label="Send"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-4 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700
                   text-white rounded-full shadow-lg flex items-center justify-center
                   transition-all hover:scale-105"
        aria-label="Open EU Study Assistant"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>
    </>
  )
}
