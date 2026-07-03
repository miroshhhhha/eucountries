import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildSystemPrompt } from './src/lib/buildKnowledge.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
const RETRY_AUTO_MAX_MS = 90_000

function parseRetryMs(errMsg) {
  const minsec = errMsg.match(/try again in (\d+)m([\d.]+)s/i)
  if (minsec) return (parseInt(minsec[1]) * 60 + parseFloat(minsec[2])) * 1000 + 500
  const sec = errMsg.match(/try again in ([\d.]+)s/i)
  if (sec) return parseFloat(sec[1]) * 1000 + 500
  return null
}

async function callGroq(apiKeys, messages) {
  const keys = apiKeys.filter(Boolean)
  let minRetryMs = null

  for (const model of MODELS) {
    for (const key of keys) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.3 }),
      })
      const data = await res.json()
      console.log(`[chat-api] ${model} key=...${key.slice(-4)} → HTTP ${res.status}`, data.error?.code ?? 'ok')

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

const COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR',
  'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
]

function chatApiDevPlugin(apiKeys) {
  const apiKey = apiKeys[0]
  const dataDir = resolve(__dirname, 'src/data')
  const allCountries = Object.fromEntries(
    COUNTRY_CODES.map(code => [
      code,
      JSON.parse(readFileSync(resolve(dataDir, `${code}.json`), 'utf-8')),
    ])
  )

  const systemPrompt = buildSystemPrompt(allCountries)

  return {
    name: 'chat-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { message, history = [] } = JSON.parse(body)

            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'GROQ_API_KEY not set in .env.local' }))
              return
            }

            const messages = [
              { role: 'system', content: systemPrompt },
              ...history.slice(-6),
              { role: 'user', content: message },
            ]
            const reply = await callGroq(apiKeys, messages)

            res.setHeader('Content-Type', 'application/json')
            if (reply.retryAfterMs !== undefined || reply.error) {
              res.statusCode = reply.retryAfterMs ? 429 : 502
              res.end(JSON.stringify({ error: reply.error, retryAfterMs: reply.retryAfterMs }))
            } else {
              res.end(JSON.stringify({ reply: reply.content }))
            }
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), chatApiDevPlugin([env.GROQ_API_KEY, env.GROQ_API_KEY_2])],
  }
})
