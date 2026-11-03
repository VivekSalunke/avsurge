type RegionCode = 'IN' | 'US'

interface AffiliateConfig {
  domain: string
  tag: string
}

const AFFILIATE_CONFIG: Record<RegionCode, AffiliateConfig> = {
  IN: { domain: 'amazon.in', tag: 'avsurge-21' },
  // TODO: replace with real Amazon Associates US tag once registered
  US: { domain: 'amazon.com', tag: 'avsurge-21' },
}

/**
 * Builds an Amazon affiliate search URL for a device, region-aware.
 * Defaults to IN to preserve existing behavior.
 */
export function buildAmazonSearchUrl(
  deviceName: string,
  region: RegionCode = 'IN'
): string {
  const config = AFFILIATE_CONFIG[region] ?? AFFILIATE_CONFIG.IN
  return `https://www.${config.domain}/s?k=${encodeURIComponent(deviceName)}&tag=${config.tag}`
}

/**
 * Adds the Amazon India affiliate tag to a direct product link,
 * replacing any tag already on it. Non-Amazon links are returned unchanged.
 */
export function withAmazonTag(url: string): string {
  try {
    const u = new URL(url)
    if (!/(^|\.)amazon\.in$/.test(u.hostname)) return url
    u.searchParams.set('tag', AFFILIATE_CONFIG.IN.tag)
    return u.toString()
  } catch {
    return url
  }
}

/** Flipkart search link (no affiliate programme set up yet) */
export function buildFlipkartSearchUrl(query: string): string {
  return `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`
}
