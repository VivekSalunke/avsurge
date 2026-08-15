/**
 * AVSurge chipset performance tiers.
 *
 * Scores are manually curated from general real-world performance
 * positioning, CPU/GPU/AI capability and market tier.
 *
 * The lookup is intentionally tolerant because database values may contain:
 * - Qualcomm / MediaTek / Google prefixes
 * - process-node information such as "(4 nm)"
 * - "Mobile Platform"
 * - "5G"
 * - trademark symbols
 * - minor naming variations
 */

export const CHIPSET_TIERS: Record<string, number> = {
  // Apple
  'a13 bionic': 70,
  'a14 bionic': 74,
  'a15 bionic': 78,
  'a16 bionic': 82,
  'a17 pro': 88,
  'a18': 90,
  'a18 pro': 93,

  // Snapdragon flagship
  'snapdragon 888': 68,
  'snapdragon 8 gen 1': 72,
  'snapdragon 8+ gen 1': 76,
  'snapdragon 8 gen 2': 80,
  'snapdragon 8 gen 3': 85,
  'snapdragon 8s gen 3': 78,
  'snapdragon 8s gen 4': 88,
  'snapdragon 8 elite': 92,
  'snapdragon 8 elite gen 2': 95,

  // Snapdragon upper-mid
  'snapdragon 7 gen 1': 58,
  'snapdragon 7+ gen 2': 62,
  'snapdragon 7 gen 3': 64,
  'snapdragon 7+ gen 3': 68,
  'snapdragon 7s gen 2': 55,
  'snapdragon 7s gen 3': 60,
  'snapdragon 778g': 52,
  'snapdragon 778g+': 54,
  'snapdragon 782g': 53,

  // Snapdragon mid
  'snapdragon 6 gen 1': 45,
  'snapdragon 6s gen 3': 42,
  'snapdragon 695': 40,
  'snapdragon 685': 35,

  // Snapdragon budget
  'snapdragon 4 gen 1': 28,
  'snapdragon 4 gen 2': 30,
  'snapdragon 4s gen 2': 27,

  // Dimensity flagship
  'dimensity 9000': 78,
  'dimensity 9300': 88,
  'dimensity 9300+': 90,
  'dimensity 9400': 93,
  'dimensity 8200': 65,
  'dimensity 8300 ultra': 70,
  'dimensity 8350': 72,
  'dimensity 8400 ultra': 75,
  'dimensity 8020': 60,

  // Dimensity mid
  'dimensity 7050': 50,
  'dimensity 7200': 55,
  'dimensity 7200 pro': 57,
  'dimensity 7200 ultra': 58,
  'dimensity 7025': 48,
  'dimensity 7020': 46,
  'dimensity 7300': 58,
  'dimensity 7300 energy': 56,
  'dimensity 7300 ultra': 60,
  'dimensity 7300x': 59,
  'dimensity 7350 pro': 61,
  'dimensity 1080': 48,
  'dimensity 1300': 55,

  // Dimensity budget / older
  'dimensity 920': 42,
  'dimensity 900': 38,
  'dimensity 6080': 32,
  'dimensity 6100+': 30,
  'dimensity 6300': 33,

  // Exynos
  'exynos 1280': 40,
  'exynos 1380': 44,
  'exynos 1480': 46,
  'exynos 1580': 50,
  'exynos 2100': 55,
  'exynos 2500': 85,

  // Google Tensor
  'tensor g2': 62,
  'tensor g3': 66,
  'tensor g4': 70,

  // Helio
  'helio g85': 25,
  'helio g88': 26,
  'helio g91 ultra': 28,
  'helio g99 ultra': 32,
  'helio g99 ultimate': 33,

  // Unisoc / older
  'unisoc t610': 18,
  'unisoc t612': 19,
  'unisoc t616': 22,
  'unisoc t618': 24,
  'helio g80': 28,
  'helio g90t': 34,
  'helio p22t': 15,
  'snapdragon 680': 30,
  'snapdragon 860': 48,
  'snapdragon 870': 62,

  // Apple M-series
  'm1': 75,
  'apple m1': 75,
  'm2': 82,
  'apple m2': 82,
  'm3': 87,
  'apple m3': 87,
  'm4': 91,
  'apple m4': 91,
}

export const UNKNOWN_CHIPSET_SCORE = 40

/**
 * Normalize chipset names so equivalent database values resolve
 * to the same curated tier.
 */
function normalizeChipsetName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[®™©]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b\d+\s*nm\b/g, ' ')
    .replace(/\bmobile platform\b/g, ' ')
    .replace(/\bmobile platform for\b/g, ' ')
    .replace(/\b5g\b/g, ' ')
    .replace(/\b4g\b/g, ' ')
    .replace(/^qualcomm\s+/, '')
    .replace(/^mediatek\s+/, '')
    .replace(/^google\s+/, '')
    .replace(/^apple\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Finds the closest curated chipset tier.
 *
 * Exact match is preferred.
 * If an exact match does not exist, the function checks whether the
 * normalized database value starts with a known chipset name.
 *
 * This handles values such as:
 *
 * "Qualcomm Snapdragon 8 Gen 3 (4 nm)"
 * "Snapdragon 8 Gen 3 Mobile Platform"
 * "MediaTek Dimensity 9300+ (4 nm)"
 */
export function getChipsetScore(
  rawChipsetName: string | null | undefined
): number {
  if (!rawChipsetName) {
    return UNKNOWN_CHIPSET_SCORE
  }

  const normalized = normalizeChipsetName(rawChipsetName)

  if (!normalized) {
    return UNKNOWN_CHIPSET_SCORE
  }

  // 1. Exact match
  if (CHIPSET_TIERS[normalized] !== undefined) {
    return CHIPSET_TIERS[normalized]
  }

  // 2. Prefer the longest matching chipset name.
  // This prevents "snapdragon 8 elite" from incorrectly matching
  // "snapdragon 8 elite gen 2".
  const matches = Object.keys(CHIPSET_TIERS)
    .filter(key => {
      if (normalized === key) return true

      return (
        normalized.startsWith(`${key} `) ||
        normalized.startsWith(`${key}-`)
      )
    })
    .sort((a, b) => b.length - a.length)

  if (matches.length > 0) {
    return CHIPSET_TIERS[matches[0]]
  }

  return UNKNOWN_CHIPSET_SCORE
}
