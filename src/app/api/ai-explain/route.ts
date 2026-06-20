import { NextRequest, NextResponse } from 'next/server'

const FREE_MODELS = [
  'openai/gpt-oss-20b:free',
  'google/gemma-4-26b-a4b-it:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
]

export async function POST(req: NextRequest) {
  const { label, value, phoneName } = await req.json()

  if (!label || !value) {
    return NextResponse.json({ error: 'Missing label or value' }, { status: 400 })
  }

  const prompt = `You are a smartphone expert explaining specs to a regular person in India.

Phone: ${phoneName}
Spec: ${label} = ${value}

Explain what this spec means in simple terms in 2-3 sentences. 
- Say if it's good, average, or bad for the price
- Give a real world example of what it means for daily use
- Keep it simple, no jargon

Respond ONLY with a JSON object:
{
  "explanation": "2-3 sentence explanation in simple terms",
  "rating": "excellent/good/average/basic",
  "tip": "one practical tip about this spec"
}`

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://avsurge.com',
          'X-Title': 'AVSurge',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.3,
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error) continue

      const text = data.choices?.[0]?.message?.content || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.explanation) return NextResponse.json(parsed)
    } catch {
      continue
    }
  }

  return NextResponse.json({ error: 'All models unavailable.' }, { status: 503 })
}
