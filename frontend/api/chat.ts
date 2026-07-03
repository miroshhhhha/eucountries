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
  role: 'user' | 'assistant'
  content: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body as { message: string; history: Message[] }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' })
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-6),
        { role: 'user', content: message },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  })

  if (!groqRes.ok) {
    const data = await groqRes.json() as { error?: { message?: string } }
    const errMsg = data.error?.message ?? 'Groq error'
    const match = errMsg.match(/try again in ([\d.]+)s/i)
    const retryAfterMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : null
    return res.status(retryAfterMs ? 429 : 502).json({ error: errMsg, retryAfterMs })
  }

  const data = await groqRes.json() as { choices: [{ message: { content: string } }] }
  return res.json({ reply: data.choices[0].message.content })
}
