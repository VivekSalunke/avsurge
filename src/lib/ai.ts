/**
 * Shared AI helper for the AI routes (explain, compare, recommend).
 *
 * Tries several free providers in order. A provider is only used when its
 * API key is set:
 *   1. Groq        (GROQ_API_KEY)
 *   2. Gemini      (GEMINI_API_KEY)
 *   3. OpenRouter  (OPENROUTER_API_KEY, free models only)
 *
 * Free models change often, so each provider's current model list is read
 * from its API (cached for an hour) and models are picked by preference
 * instead of being hardcoded.
 */

interface ProviderModel {
  id: string
  contextLength: number
}

interface Provider {
  name: string
  baseUrl: string
  apiKey: () => string | undefined
  extraHeaders?: Record<string, string>
  /** Turn the provider's /models response into usable, ordered model IDs */
  pickModels: (models: ProviderModel[]) => string[]
  /** Used if the model list cannot be fetched */
  fallbackModels: string[]
  /** Optional per-model settings (e.g. keep "thinking" short) */
  extraBody?: (model: string) => Record<string, unknown>
}

const MODELS_PER_PROVIDER = 2
const PER_CALL_TIMEOUT_MS = 15_000
const OVERALL_DEADLINE_MS = 45_000
const MODEL_LIST_TTL_MS = 60 * 60 * 1000

/** Order `ids` by the first regex in `prefs` each one matches */
function byPreference(ids: string[], prefs: RegExp[]): string[] {
  const rank = (id: string) => {
    const i = prefs.findIndex(p => p.test(id))
    return i === -1 ? prefs.length : i
  }
  return [...ids].sort((a, b) => rank(a) - rank(b))
}

const PROVIDERS: Provider[] = [
  {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: () => process.env.GROQ_API_KEY,
    pickModels: models =>
      byPreference(
        models
          .map(m => m.id)
          .filter(id => !/(whisper|tts|playai|guard|embed|compound|vision|distil)/i.test(id)),
        [/gpt-oss-120b/, /gpt-oss-20b/, /qwen/, /llama.*70b/, /llama/]
      ),
    fallbackModels: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
    extraBody: model => (/gpt-oss/.test(model) ? { reasoning_effort: 'low' } : {}),
  },
  {
    name: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: () => process.env.GEMINI_API_KEY,
    pickModels: models => {
      const ids = models
        .map(m => m.id.replace(/^models\//, ''))
        .filter(id => /^gemini-[\d.]+-flash/.test(id))
        .filter(id => !/(preview|exp|image|tts|audio|live|embedding|thinking)/i.test(id))
      const version = (id: string) => parseFloat(id.match(/^gemini-([\d.]+)/)?.[1] ?? '0')
      // Newest first; full Flash before Flash-Lite within the same version
      return ids.sort((a, b) =>
        version(b) - version(a) || Number(/lite/.test(a)) - Number(/lite/.test(b)) || a.localeCompare(b)
      )
    },
    fallbackModels: ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    extraBody: () => ({ reasoning_effort: 'low' }),
  },
  {
    name: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: () => process.env.OPENROUTER_API_KEY,
    extraHeaders: { 'HTTP-Referer': 'https://avsurge.com', 'X-Title': 'AVSurge' },
    pickModels: models =>
      byPreference(
        models
          .filter(m => m.id.endsWith(':free') && m.contextLength >= 8000)
          .filter(m => !/(content-safety|guard|moderation|embed|code)/i.test(m.id))
          .sort((a, b) => b.contextLength - a.contextLength)
          .map(m => m.id),
        [/gemma-4-31b/, /gemma-4-26b/, /nemotron-3-ultra/, /inkling:free/, /nemotron-3\.5-lightning/]
      ),
    fallbackModels: ['google/gemma-4-31b-it:free', 'google/gemma-4-26b-a4b-it:free'],
    extraBody: () => ({ reasoning: { effort: 'low', exclude: true } }),
  },
]

const modelCache = new Map<string, { ids: string[]; at: number }>()

async function listModels(p: Provider, key: string): Promise<string[]> {
  const cached = modelCache.get(p.name)
  if (cached && Date.now() - cached.at < MODEL_LIST_TTL_MS) return cached.ids
  try {
    const res = await fetch(`${p.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = (await res.json()) as {
      data?: { id: string; context_length?: number; context_window?: number }[]
    }
    const models: ProviderModel[] = (body.data ?? []).map(m => ({
      id: m.id,
      contextLength: m.context_length ?? m.context_window ?? 0,
    }))
    const ids = p.pickModels(models)
    if (ids.length === 0) throw new Error('no usable models in list')
    modelCache.set(p.name, { ids, at: Date.now() })
    return ids
  } catch (err) {
    console.warn(`[ai] ${p.name}: could not list models (${err instanceof Error ? err.message : err}), using fallback list`)
    return p.fallbackModels
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

/** True if at least one provider has an API key */
export function aiConfigured(): boolean {
  return PROVIDERS.some(p => Boolean(p.apiKey()))
}

type Attempt = { ok: true; text: string; finish?: string } | { ok: false; status: number; message: string }

async function callModel(
  p: Provider, key: string, model: string, prompt: string, maxTokens: number, extras: Record<string, unknown>
): Promise<Attempt> {
  const res = await fetch(`${p.baseUrl}/chat/completions`, {
    method: 'POST',
    signal: AbortSignal.timeout(PER_CALL_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...p.extraHeaders },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
      ...extras,
    }),
  })
  const data = await res.json().catch(() => null)
  const errorBody = Array.isArray(data) ? data[0]?.error : data?.error
  if (!res.ok || !data || errorBody) {
    return { ok: false, status: res.status, message: errorBody?.message ?? 'no body' }
  }
  const choice = data.choices?.[0]
  return { ok: true, text: choice?.message?.content || '', finish: choice?.finish_reason }
}

/**
 * Sends one prompt to the configured providers until a model returns JSON
 * that passes `isValid`. Returns null if everything fails (details are logged).
 */
export async function generateJson<T>(
  prompt: string,
  opts: { tag: string; maxTokens: number; isValid: (value: unknown) => value is T }
): Promise<T | null> {
  const started = Date.now()
  let tried = 0

  for (const p of PROVIDERS) {
    const key = p.apiKey()
    if (!key) continue
    const models = (await listModels(p, key)).slice(0, MODELS_PER_PROVIDER)

    for (const model of models) {
      if (Date.now() - started > OVERALL_DEADLINE_MS) {
        console.error(`[ai:${opts.tag}] gave up after ${tried} attempts (time limit)`)
        return null
      }
      tried++
      const label = `${p.name}/${model}`
      try {
        const extras = p.extraBody?.(model) ?? {}
        let attempt = await callModel(p, key, model, prompt, opts.maxTokens, extras)
        // Some models reject optional settings like reasoning_effort: retry once without them
        if (!attempt.ok && attempt.status === 400 && Object.keys(extras).length > 0) {
          console.warn(`[ai:${opts.tag}] ${label} rejected extra settings (${attempt.message}), retrying without`)
          attempt = await callModel(p, key, model, prompt, opts.maxTokens, {})
        }
        if (!attempt.ok) {
          console.warn(`[ai:${opts.tag}] ${label} -> HTTP ${attempt.status}: ${attempt.message}`)
          continue
        }
        const parsed = extractJson(attempt.text)
        if (parsed !== null && opts.isValid(parsed)) return parsed
        console.warn(`[ai:${opts.tag}] ${label} -> unusable answer (finish_reason=${attempt.finish}, ${attempt.text.length} chars)`)
      } catch (err) {
        console.warn(`[ai:${opts.tag}] ${label} -> ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  console.error(`[ai:${opts.tag}] all ${tried} attempts failed`)
  return null
}
