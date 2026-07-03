import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildSystemPrompt } from './src/lib/buildKnowledge.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR',
  'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
]

function chatApiDevPlugin(apiKey) {
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

            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...history.slice(-6),
                  { role: 'user', content: message },
                ],
                max_tokens: 1024,
                temperature: 0.3,
              }),
            })

            const data = await groqRes.json()
            if (!groqRes.ok || !data.choices) {
              const errMsg = data.error?.message ?? JSON.stringify(data)
              const match = errMsg.match(/try again in ([\d.]+)s/i)
              const retryAfterMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : null
              console.error('[chat-api] Groq error:', errMsg)
              res.statusCode = retryAfterMs ? 429 : 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: errMsg, retryAfterMs }))
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ reply: data.choices[0].message.content }))
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
    plugins: [react(), tailwindcss(), chatApiDevPlugin(env.GROQ_API_KEY)],
  }
})
