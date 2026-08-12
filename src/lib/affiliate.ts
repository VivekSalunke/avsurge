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
