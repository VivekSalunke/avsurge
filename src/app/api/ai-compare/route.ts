import { NextRequest, NextResponse } from 'next/server'

const FREE_MODELS = [
  'openai/gpt-oss-20b:free',
  'google/gemma-4-26b-a4b-it:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
]

async function callOpenRouter(model: string, prompt: string) {
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
      max_tokens: 600,
      temperature: 0.3,
    }),
  })
  return response
}

export async function POST(req: NextRequest) {
  const { phoneA, phoneB, specsA, specsB } = await req.json()

  if (!phoneA || !phoneB) {
    return NextResponse.json({ error: 'Missing phones' }, { status: 400 })
  }

  const formatSpecs = (specs: any[]) =>
    specs.map(s => `${s.label}: ${s.value}`).join(', ')

  const prompt = `You are a smartphone expert. Compare these two phones and give a verdict.

Phone A: ${phoneA.name} (${phoneA.brand}) - ₹${phoneA.price_inr?.toLocaleString('en-IN')}
Specs: ${formatSpecs(specsA)}

Phone B: ${phoneB.name} (${phoneB.brand}) - ₹${phoneB.price_inr?.toLocaleString('en-IN')}
Specs: ${formatSpecs(specsB)}

Respond ONLY with a JSON object in this exact format, no markdown, no extra text:
{
  "verdict": "One sentence verdict on which phone is better overall",
  "buy_a_if": "One sentence describing who should buy ${phoneA.name}",
  "buy_b_if": "One sentence describing who should buy ${phoneB.name}",
  "winner_camera": "${phoneA.name} or ${phoneB.name}",
  "winner_battery": "${phoneA.name} or ${phoneB.name}",
  "winner_performance": "${phoneA.name} or ${phoneB.name}",
  "winner_value": "${phoneA.name} or ${phoneB.name}"
}`

  for (const model of FREE_MODELS) {
    try {
      const response = await callOpenRouter(model, prompt)
      const data = await response.json()

      if (!response.ok || data.error) continue

      const text = data.choices?.[0]?.message?.content || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.verdict) return NextResponse.json(parsed)
    } catch {
      continue
    }
  }

  return NextResponse.json({ error: 'All models unavailable. Please try again.' }, { status: 503 })
}
