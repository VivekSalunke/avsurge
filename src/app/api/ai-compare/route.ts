import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { aiConfigured, generateJson } from '@/lib/ai'

interface SpecItem {
  label: string
  value: string
}

interface CompareVerdict {
  verdict: string
  [key: string]: unknown
}

const isVerdict = (v: unknown): v is CompareVerdict =>
  typeof v === 'object' && v !== null && typeof (v as CompareVerdict).verdict === 'string'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`ai-compare:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { phoneA, phoneB, specsA, specsB } = await req.json()

  if (!phoneA || !phoneB) {
    return NextResponse.json({ error: 'Missing phones' }, { status: 400 })
  }
  if (typeof phoneA.name !== 'string' || typeof phoneB.name !== 'string'
    || phoneA.name.length > 200 || phoneB.name.length > 200
    || !Array.isArray(specsA) || !Array.isArray(specsB)
    || specsA.length > 100 || specsB.length > 100) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (!aiConfigured()) {
    return NextResponse.json(
      { error: 'AI service is not configured (no AI provider API key set).' },
      { status: 503 }
    )
  }

  const formatSpecs = (specs: SpecItem[]) =>
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

  const result = await generateJson(prompt, { tag: 'compare', maxTokens: 1200, isValid: isVerdict })
  if (result) return NextResponse.json(result)

  return NextResponse.json({ error: 'AI is busy right now. Please try again in a minute.' }, { status: 503 })
}
