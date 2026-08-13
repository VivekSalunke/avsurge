import '../lib/force-ipv4'
import { createClient } from '@supabase/supabase-js'
import { computeSpecScore, parseSpecs } from '../lib/specScore'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=:#]+?)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data: phones, error } = await supabase
    .from('phones')
    .select('id, name, price_inr')
    .not('price_inr', 'is', null)
    .order('price_inr', { ascending: true })

  console.log('Error:', error)
  console.log('Phones returned:', phones?.length ?? 0)

  if (!phones || phones.length === 0) return

  const cheapest = phones[0]
  const mid = phones[Math.floor(phones.length / 2)]
  const flagship = phones[phones.length - 1]

  for (const phone of [cheapest, mid, flagship]) {
    const { data: specs } = await supabase
      .from('phone_specs')
      .select('category, label, value')
      .eq('phone_id', phone.id)

    const parsed = parseSpecs(specs || [])
    const score = computeSpecScore(specs || [])

    console.log('---')
    console.log(`${phone.name} — ₹${phone.price_inr?.toLocaleString('en-IN')}`)
    console.log('Parsed:', parsed)
    console.log('Spec Score:', score)
  }
}

main()
