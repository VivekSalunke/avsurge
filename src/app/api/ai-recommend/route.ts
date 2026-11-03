import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { aiConfigured, generateJson } from '@/lib/ai'

interface RecommendPhone {
  name: string
  brand: string
  price_inr?: number | null
  specs: Record<string, string>
}

interface Recommendation {
  explanation?: string
  recommendations: { name: string; reason: string }[]
}

const isRecommendation = (v: unknown): v is Recommendation =>
  typeof v === 'object' && v !== null && Array.isArray((v as Recommendation).recommendations)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`ai-recommend:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { query, phones } = await req.json()

  if (!query || !phones) {
    return NextResponse.json({ error: 'Missing query or phones' }, { status: 400 })
  }
  if (typeof query !== 'string' || query.length > 500 || !Array.isArray(phones) || phones.length > 200) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (!aiConfigured()) {
    return NextResponse.json(
      { error: 'AI service is not configured (missing OPENROUTER_API_KEY).' },
      { status: 503 }
    )
  }

  const limitedPhones = phones.slice(0, 80)

  const phoneSummary = limitedPhones.map((p: RecommendPhone) =>
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

  const result = await generateJson(prompt, { tag: 'recommend', maxTokens: 1200, isValid: isRecommendation })
  if (result) return NextResponse.json(result)

  return NextResponse.json({ error: 'AI is busy right now. Please try again in a minute.' }, { status: 503 })
}
