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

/**
 * Normalize labels so small database differences don't break scoring.
 */
function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

/**
 * Find a specification using exact or partial label matching.
 */
function findSpecValue(
  specs: SpecRow[],
  labels: string[]
): string | null {
  const normalizedLabels = labels.map(normalizeLabel)

  // First try exact matches
  for (const spec of specs) {
    const label = normalizeLabel(spec.label)

    if (normalizedLabels.includes(label)) {
      return spec.value
    }
  }

  // Then try partial matches
  for (const spec of specs) {
    const label = normalizeLabel(spec.label)

    if (
      normalizedLabels.some(
        candidate =>
          label.includes(candidate) ||
          candidate.includes(label)
      )
    ) {
      return spec.value
    }
  }

  return null
}

/**
 * Extract the largest number from a value.
 *
 * Examples:
 * "8GB / 12GB LPDDR4X" -> 12
 * "6000 mAh" -> 6000
 * "120Hz" -> 120
 * "80W" -> 80
 */
function extractMaxNumber(value: string | null): number | null {
  if (!value) return null

  const matches = value.match(/\d+(?:\.\d+)?/g)

  if (!matches) return null

  const nums = matches.map(Number)

  return Math.max(...nums)
}

/**
 * Extract the largest camera megapixel value.
 *
 * Example:
 * "50MP + 8MP + 2MP" -> 50
 */
function extractMaxMP(value: string | null): number | null {
  if (!value) return null

  const matches = value.match(
    /(\d+(?:\.\d+)?)\s*MP/gi
  )

  if (!matches) return null

  const nums = matches.map(match =>
    parseFloat(match)
  )

  return Math.max(...nums)
}

export function parseSpecs(
  specs: SpecRow[]
): ParsedSpecs {
  const ramRaw = findSpecValue(specs, [
    'RAM',
    'Memory',
    'RAM Type',
  ])

  const batteryRaw = findSpecValue(specs, [
    'Capacity',
    'Battery',
    'Battery Capacity',
  ])

  const chargingRaw = findSpecValue(specs, [
    'Charging speed',
    'Charging Speed',
    'Charging',
    'Fast Charging',
    'Wired Charging',
  ])

  const chipsetRaw = findSpecValue(specs, [
    'Chipset',
    'Processor',
    'SoC',
  ])

  return {
    ramGB: extractMaxNumber(ramRaw),
    batteryMah: extractMaxNumber(batteryRaw),
    refreshRateHz: null,
    chargingWatts: extractMaxNumber(chargingRaw),
    mainCameraMP: null,
    chipsetScore: getChipsetScore(chipsetRaw),
  }
}

/**
 * Normalize a raw value against a realistic maximum.
 */
function normalize(
  value: number | null,
  realisticMax: number
): number {
  if (value === null) return 50

  return Math.min(
    100,
    (value / realisticMax) * 100
  )
}

/**
 * AVSurge Spec Score weights.
 *
 * These weights reflect the fields currently available
 * consistently in the phone_specs database:
 *
 * - Chipset: 55%
 * - Battery capacity: 30%
 * - Charging speed: 15%
 *
 * Camera, RAM, display and brightness are intentionally
 * excluded because those fields are not consistently
 * available across the current phone database.
 */
const WEIGHTS = {
  chipset: 0.55,
  battery: 0.30,
  charging: 0.15,
}

export function computeSpecScore(
  specs: SpecRow[]
): number {
  const parsed = parseSpecs(specs)

  const components: Array<{
    value: number | null
    weight: number
    max: number
  }> = [
    {
      value: parsed.chipsetScore,
      weight: WEIGHTS.chipset,
      max: 100,
    },
    {
      value: parsed.batteryMah,
      weight: WEIGHTS.battery,
      max: 6000,
    },
    {
      value: parsed.chargingWatts,
      weight: WEIGHTS.charging,
      max: 100,
    },
  ]

  // Only use available components and re-normalize their weights.
  const available = components.filter(
    component => component.value !== null
  )

  const totalWeight = available.reduce(
    (sum, component) => sum + component.weight,
    0
  )

  if (totalWeight === 0) {
    return 0
  }

  const score = available.reduce(
    (sum, component) => {
      const normalizedValue =
        component.max === 100
          ? Math.min(100, component.value as number)
          : normalize(
              component.value,
              component.max
            )

      return (
        sum +
        normalizedValue *
          (component.weight / totalWeight)
      )
    },
    0
  )

  return Math.round(score)
}

/**
 * Returns the final AVSurge Spec Score.
 *
 * A manually entered score always takes priority.
 * Otherwise the score is calculated automatically.
 */
export function getFinalSpecScore(
  specs: SpecRow[],
  overrideScore: number | null | undefined
): number {
  if (
    overrideScore !== null &&
    overrideScore !== undefined
  ) {
    return overrideScore
  }

  return computeSpecScore(specs)
}
