/**
 * Shared OpenRouter helper for the AI routes (explain, compare, recommend).
 *
 * OpenRouter's free models change every few months, so instead of a
 * hardcoded list we read the live model list (cached for an hour) and only
 * try free models that still exist. Models we know work well are tried first.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1'

// Tried first, in this order, if they are still free. Anything else that is
// free and text-capable is tried after these.
const PREFERRED_FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'thinkingmachines/inkling:free',
  'nvidia/nemotron-3.5-lightning:free',
  'thinkingmachines/inkling-small:free',
]

// Free models that are not general chat models
const EXCLUDE = /(content-safety|guard|moderation|embed|code)/i

const MAX_ATTEMPTS = 4
const PER_CALL_TIMEOUT_MS = 15_000
const MODEL_LIST_TTL_MS = 60 * 60 * 1000

interface OpenRouterModel {
  id: string
  context_length?: number
  architecture?: { input_modalities?: string[]; output_modalities?: string[] }
}

let cachedModels: { ids: string[]; at: number } | null = null

async function listFreeModels(): Promise<string[]> {
  if (cachedModels && Date.now() - cachedModels.at < MODEL_LIST_TTL_MS) return cachedModels.ids
  try {
    const res = await fetch(`${OPENROUTER_URL}/models`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = (await res.json()) as { data: OpenRouterModel[] }
    const usable = data.filter(m =>
      m.id.endsWith(':free') &&
      !EXCLUDE.test(m.id) &&
      (m.context_length ?? 0) >= 8000 &&
      (m.architecture?.input_modalities ?? ['text']).includes('text') &&
      (m.architecture?.output_modalities ?? ['text']).includes('text')
    )
    const rank = (id: string) => {
      const i = PREFERRED_FREE_MODELS.indexOf(id)
      return i === -1 ? PREFERRED_FREE_MODELS.length : i
    }
    const ids = usable
      .sort((a, b) => rank(a.id) - rank(b.id) || (b.context_length ?? 0) - (a.context_length ?? 0))
      .map(m => m.id)
    if (ids.length > 0) cachedModels = { ids, at: Date.now() }
    return ids.length > 0 ? ids : PREFERRED_FREE_MODELS
  } catch (err) {
    console.warn('[ai] could not load OpenRouter model list, using preferred list:', err)
    return PREFERRED_FREE_MODELS
  }
}

function extractJson(text: string): unknown | null {
  const clean = text.replace(/```json|```/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

export function aiConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY)
}

/**
 * Sends one prompt to free models until one returns JSON that passes
 * `isValid`. Returns null if every attempt fails (details go to the logs).
 */
export async function generateJson<T>(
  prompt: string,
  opts: { tag: string; maxTokens: number; isValid: (value: unknown) => value is T }
): Promise<T | null> {
  const models = (await listFreeModels()).slice(0, MAX_ATTEMPTS)

  for (const model of models) {
    try {
      const res = await fetch(`${OPENROUTER_URL}/chat/completions`, {
        method: 'POST',
        signal: AbortSignal.timeout(PER_CALL_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://avsurge.com',
          'X-Title': 'AVSurge',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: opts.maxTokens,
          temperature: 0.3,
          // Keep "thinking" models from spending the whole budget before answering
          reasoning: { effort: 'low', exclude: true },
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data || data.error) {
        console.warn(`[ai:${opts.tag}] ${model} -> HTTP ${res.status}: ${data?.error?.message ?? 'no body'}`)
        continue
      }
      const choice = data.choices?.[0]
      const text: string = choice?.message?.content || ''
      const parsed = extractJson(text)
      if (parsed !== null && opts.isValid(parsed)) return parsed
      console.warn(
        `[ai:${opts.tag}] ${model} -> unusable answer (finish_reason=${choice?.finish_reason}, ${text.length} chars)`
      )
    } catch (err) {
      console.warn(`[ai:${opts.tag}] ${model} -> ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.error(`[ai:${opts.tag}] all ${models.length} models failed`)
  return null
}
