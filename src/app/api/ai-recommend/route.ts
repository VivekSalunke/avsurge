import { NextRequest, NextResponse } from 'next/server'

const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'google/gemma-3-12b-it:free',
  'qwen/qwen3-8b:free',
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
      max_tokens: 500,
      temperature: 0.3,
    }),
  })
  return response
}

export async function POST(req: NextRequest) {
  const { query, phones } = await req.json()

  if (!query || !phones) {
    return NextResponse.json({ error: 'Missing query or phones' }, { status: 400 })
  }

  const limitedPhones = phones.slice(0, 80)

  const phoneSummary = limitedPhones.map((p: any) =>
    `${p.name} (${p.brand}) - ₹${p.price_inr?.toLocaleString('en-IN')} - RAM: ${p.specs['RAM'] || 'N/A'}, Camera: ${p.specs['Main camera'] || 'N/A'}, Battery: ${p.specs['Capacity'] || 'N/A'}, Charging: ${p.specs['Charging speed'] || 'N/A'}, 5G: ${p.specs['5G'] || 'N/A'}, Chipset: ${p.specs['Chipset'] || 'N/A'}`
  ).join('\n')

  const prompt = `You are a phone recommendation expert for the Indian market. Based on the user's requirement, recommend the top 3 best phones from the list below.

User requirement: "${query}"

Available phones:
${phoneSummary}

Respond ONLY with a JSON object in this exact format, no markdown, no extra text:
{
  "explanation": "Brief 1-2 sentence explanation of your recommendation approach",
  "recommendations": [
    {
      "name": "exact phone name from list",
      "reason": "specific reason why this phone matches the requirement in 1-2 sentences"
    }
  ]
}`

  for (const model of FREE_MODELS) {
    try {
      const response = await callOpenRouter(model, prompt)
      const data = await response.json()

      if (!response.ok || data.error) continue

      const text = data.choices?.[0]?.message?.content || ''
      const clean = text.replace(/```json|```/g, '').trim()

      // Extract JSON from response
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.recommendations) {
        return NextResponse.json(parsed)
      }
    } catch {
      continue
    }
  }

  return NextResponse.json({ error: 'All models unavailable. Please try again.' }, { status: 503 })
}
