import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { query, phones } = await req.json()

  if (!query || !phones) {
    return NextResponse.json({ error: 'Missing query or phones' }, { status: 400 })
  }

  // Limit to 50 phones to stay within token limits
  const limitedPhones = phones.slice(0, 50)

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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'Gemini API error', details: data }, { status: 500 })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
