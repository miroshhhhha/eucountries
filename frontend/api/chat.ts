import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createRequire } from 'module'
import { buildSystemPrompt } from '../src/lib/buildKnowledge.js'

const require = createRequire(import.meta.url)

const ALL_COUNTRIES = {
  AT: require('../src/data/AT.json'),
  BE: require('../src/data/BE.json'),
  BG: require('../src/data/BG.json'),
  CY: require('../src/data/CY.json'),
  CZ: require('../src/data/CZ.json'),
  DE: require('../src/data/DE.json'),
  DK: require('../src/data/DK.json'),
  EE: require('../src/data/EE.json'),
  ES: require('../src/data/ES.json'),
  FI: require('../src/data/FI.json'),
  FR: require('../src/data/FR.json'),
  GR: require('../src/data/GR.json'),
  HR: require('../src/data/HR.json'),
  HU: require('../src/data/HU.json'),
  IE: require('../src/data/IE.json'),
  IT: require('../src/data/IT.json'),
  LT: require('../src/data/LT.json'),
  LU: require('../src/data/LU.json'),
  LV: require('../src/data/LV.json'),
  MT: require('../src/data/MT.json'),
  NL: require('../src/data/NL.json'),
  PL: require('../src/data/PL.json'),
  PT: require('../src/data/PT.json'),
  RO: require('../src/data/RO.json'),
  SE: require('../src/data/SE.json'),
  SI: require('../src/data/SI.json'),
  SK: require('../src/data/SK.json'),
}

const SYSTEM_PROMPT = buildSystemPrompt(ALL_COUNTRIES)

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GroqResult {
  content?: string
  error?: string
  retryAfterMs?: number
}

const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
const RETRY_AUTO_MAX_MS = 90_000

function parseRetryMs(errMsg: string): number | null {
  const minsec = errMsg.match(/try again in (\d+)m([\d.]+)s/i)
  if (minsec) return (parseInt(minsec[1]) * 60 + parseFloat(minsec[2])) * 1000 + 500
  const sec = errMsg.match(/try again in ([\d.]+)s/i)
  if (sec) return parseFloat(sec[1]) * 1000 + 500
  return null
}

async function callGroq(apiKeys: string[], messages: Message[]): Promise<GroqResult> {
  const keys = apiKeys.filter(Boolean)
  let minRetryMs: number | null = null

  for (const model of MODELS) {
    for (const key of keys) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.3 }),
      })
      const data = await res.json() as { choices?: [{ message: { content: string } }]; error?: { message: string; code?: string } }
      if (res.ok && data.choices) return { content: data.choices[0].message.content }

      const errMsg = data.error?.message ?? JSON.stringify(data)
      const isRateLimit = res.status === 429
        || data.error?.code === 'rate_limit_exceeded'
        || errMsg.includes('rate_limit')
        || errMsg.includes('Rate limit')

      if (!isRateLimit) return { error: errMsg }

      const waitMs = parseRetryMs(errMsg) ?? (res.status === 413 ? 62_000 : null)
      if (waitMs) minRetryMs = minRetryMs === null ? waitMs : Math.min(minRetryMs, waitMs)
    }
  }

  if (minRetryMs !== null && minRetryMs <= RETRY_AUTO_MAX_MS) {
    return { retryAfterMs: minRetryMs }
  }
  return { error: 'daily_limit' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body as { message: string; history: Message[] }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const apiKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2].filter((k): k is string => !!k)
  if (!apiKeys.length) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' })
  }

  const msgs: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6),
    { role: 'user', content: message },
  ]

  const result = await callGroq(apiKeys, msgs)
  if (result.retryAfterMs !== undefined) return res.status(429).json({ error: result.error, retryAfterMs: result.retryAfterMs })
  if (result.error) return res.status(502).json({ error: result.error })
  return res.json({ reply: result.content })
}
