type RateLimitEntry = { count: number; resetAt: number }

const rateLimitMap = new Map<string, RateLimitEntry>()

const MAX_TRACKED_ENTRIES = 10_000

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()

  if (rateLimitMap.size > MAX_TRACKED_ENTRIES) {
    for (const [k, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(k)
    }
  }

  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}
