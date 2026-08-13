import { getChipsetScore } from './chipsetTiers'

export interface SpecRow {
  category: string
  label: string
  value: string
}

interface ParsedSpecs {
  ramGB: number | null
  batteryMah: number | null
  refreshRateHz: number | null
  chargingWatts: number | null
  mainCameraMP: number | null
  chipsetScore: number
}

/** Finds a spec by label, checking multiple possible categories since
 * raw data has inconsistent categorization (e.g. Chipset/RAM appear
 * under both "General" and "Performance" depending on device). */
function findSpecValue(specs: SpecRow[], label: string): string | null {
  const match = specs.find(s => s.label.toLowerCase() === label.toLowerCase())
  return match?.value ?? null
}

/** Extracts the largest number from a string like "8GB / 12GB LPDDR4X" -> 12 */
function extractMaxNumber(value: string | null): number | null {
  if (!value) return null
  const matches = value.match(/\d+(\.\d+)?/g)
  if (!matches) return null
  const nums = matches.map(Number)
  return Math.max(...nums)
}

/** Extracts the largest MP figure from a string like "50MP + 5MP + 2MP" -> 50 */
function extractMaxMP(value: string | null): number | null {
  if (!value) return null
  const matches = value.match(/(\d+(\.\d+)?)\s*MP/gi)
  if (!matches) return null
  const nums = matches.map(m => parseFloat(m))
  return Math.max(...nums)
}

export function parseSpecs(specs: SpecRow[]): ParsedSpecs {
  const ramRaw = findSpecValue(specs, 'RAM')
  const batteryRaw = findSpecValue(specs, 'Capacity')
  const refreshRaw = findSpecValue(specs, 'Refresh rate') ?? findSpecValue(specs, 'Display type')
  const chargingRaw = findSpecValue(specs, 'Charging speed')
  const cameraRaw = findSpecValue(specs, 'Main camera')
  const chipsetRaw = findSpecValue(specs, 'Chipset')

  return {
    ramGB: extractMaxNumber(ramRaw),
    batteryMah: extractMaxNumber(batteryRaw),
    refreshRateHz: extractMaxNumber(refreshRaw),
    chargingWatts: extractMaxNumber(chargingRaw),
    mainCameraMP: extractMaxMP(cameraRaw),
    chipsetScore: getChipsetScore(chipsetRaw),
  }
}

/**
 * Normalizes a raw value against a realistic max for its category,
 * capped at 100. Maxes are chosen based on current (2026) flagship-tier
 * ranges, not theoretical limits.
 */
function normalize(value: number | null, realisticMax: number): number {
  if (value === null) return 50 // neutral score when data is missing, avoids unfairly tanking the total
  return Math.min(100, (value / realisticMax) * 100)
}

const WEIGHTS = {
  chipset: 0.35,
  camera: 0.25,
  battery: 0.20,
  display: 0.15,
  charging: 0.05,
}

export function computeSpecScore(specs: SpecRow[]): number {
  const parsed = parseSpecs(specs)

  const chipsetComponent = parsed.chipsetScore
  const cameraComponent = normalize(parsed.mainCameraMP, 108) // 108MP+ sensors are a common flagship reference point
  const batteryComponent = normalize(parsed.batteryMah, 6000) // 6000mAh+ treated as top-tier
  const displayComponent = normalize(parsed.refreshRateHz, 144) // 144Hz+ as top-tier refresh
  const chargingComponent = normalize(parsed.chargingWatts, 100) // 100W+ as top-tier fast charging

  const score =
    chipsetComponent * WEIGHTS.chipset +
    cameraComponent * WEIGHTS.camera +
    batteryComponent * WEIGHTS.battery +
    displayComponent * WEIGHTS.display +
    chargingComponent * WEIGHTS.charging

  return Math.round(score)
}

/**
 * Returns the final Spec Score for a device: the manual override if set,
 * otherwise the computed score from parsed specs. Use this everywhere a
 * score is displayed — never call computeSpecScore() directly for display,
 * since that skips the override check.
 */
export function getFinalSpecScore(
  specs: SpecRow[],
  overrideScore: number | null | undefined
): number {
  if (overrideScore !== null && overrideScore !== undefined) {
    return overrideScore
  }
  return computeSpecScore(specs)
}
