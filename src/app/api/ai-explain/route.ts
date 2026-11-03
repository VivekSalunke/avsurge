import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { aiConfigured, generateJson } from '@/lib/ai'

interface Explanation {
  explanation: string
  rating?: string
  tip?: string
}

const isExplanation = (v: unknown): v is Explanation =>
  typeof v === 'object' && v !== null && typeof (v as Explanation).explanation === 'string'

const MAX_PER_HOUR = 20

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`ai-explain:${ip}`, MAX_PER_HOUR, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { label, value, phoneName } = await req.json()

  if (!label || !value) {
    return NextResponse.json({ error: 'Missing label or value' }, { status: 400 })
  }
  if (typeof label !== 'string' || typeof value !== 'string' || typeof phoneName !== 'string'
    || label.length > 200 || value.length > 500 || phoneName.length > 200) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (!aiConfigured()) {
    return NextResponse.json(
      { error: 'AI service is not configured (missing OPENROUTER_API_KEY).' },
      { status: 503 }
    )
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

  const result = await generateJson(prompt, { tag: 'explain', maxTokens: 600, isValid: isExplanation })
  if (result) return NextResponse.json(result)

  return NextResponse.json({ error: 'AI is busy right now. Please try again in a minute.' }, { status: 503 })
}
