import { getChipsetScore } from './chipsetTiers'

export interface SpecRow {
  category: string
  label: string
  value: string
}

function findSpecValue(specs: SpecRow[], label: string): string | null {
  const match = specs.find(s => s.label.toLowerCase() === label.toLowerCase())
  return match?.value ?? null
}

function extractMaxNumber(value: string | null): number | null {
  if (!value) return null
  const matches = value.match(/\d+(\.\d+)?/g)
  if (!matches) return null
  return Math.max(...matches.map(Number))
}

/**
 * Scores a laptop CPU (0-100) based on brand/tier naming, since exact model
 * numbers (i7-1360P, Ryzen 7 7840HS, etc.) are too numerous to manually
 * tier like phone chipsets. Uses tier keywords instead.
 */
function scoreCpu(processorRaw: string | null): number {
  if (!processorRaw) return 50
  const p = processorRaw.toLowerCase()

  // Apple Silicon — reuse the phone/tablet chipset table (M1-M4 already scored there)
  if (p.includes('apple m') || /\bm[1-4]\b/.test(p)) {
    const base = getChipsetScore(processorRaw)
    if (p.includes('max')) return Math.min(100, base + 8)
    if (p.includes('pro')) return Math.min(100, base + 4)
    return base
  }

  // Intel Core Ultra (newest naming, 2024+)
  if (p.includes('core ultra 9')) return 90
  if (p.includes('core ultra 7')) return 82
  if (p.includes('core ultra 5')) return 68

  // Intel Core (classic naming)
  if (p.includes('core i9')) return 88
  if (p.includes('core i7')) return 78
  if (p.includes('core i5')) return 62
  if (p.includes('core i3')) return 45

  // AMD Ryzen
  if (p.includes('ryzen 9')) return 88
  if (p.includes('ryzen 7')) return 78
  if (p.includes('ryzen 5')) return 62
  if (p.includes('ryzen 3')) return 45

  // Budget/legacy (Celeron, Pentium, older Athlon)
  if (p.includes('celeron') || p.includes('pentium')) return 25

  return 50 // unrecognized CPU naming, neutral default
}

/**
 * Scores a laptop GPU (0-100) based on integrated vs discrete tier.
 */
function scoreGpu(gpuRaw: string | null): number {
  if (!gpuRaw) return 40
  const g = gpuRaw.toLowerCase()

  // High-end discrete
  if (/rtx 4(0[89]0|090)/.test(g) || /rtx 3(080|090)/.test(g)) return 92
  if (/rtx 40[67]0/.test(g)) return 80
  if (/rtx 30[67]0/.test(g)) return 72

  // Entry discrete
  if (/rtx 40[45]0/.test(g) || /rtx 20[45]0/.test(g) || g.includes('mx')) return 58
  if (g.includes('radeon') && /\d{3}m/.test(g)) return 55 // e.g. Radeon 660M/610M

  // Apple integrated (very capable relative to typical integrated)
  if (g.includes('apple') || (g.includes('m1') || g.includes('m2') || g.includes('m3') || g.includes('m4'))) return 70

  // Standard integrated
  if (g.includes('iris xe')) return 42
  if (g.includes('radeon graphics') || g.includes('uhd graphics') || g.includes('iris')) return 35

  return 40 // unrecognized, neutral-low default
}

function normalize(value: number | null, realisticMax: number, fallback = 50): number {
  if (value === null) return fallback
  return Math.min(100, (value / realisticMax) * 100)
}

interface ParsedLaptopSpecs {
  cpuScore: number
  gpuScore: number
  ramGB: number | null
  storageGB: number | null
  refreshRateHz: number | null
  batteryHours: number | null
}

export function parseLaptopSpecs(specs: SpecRow[]): ParsedLaptopSpecs {
  const processorRaw = findSpecValue(specs, 'Processor')
  const gpuRaw = findSpecValue(specs, 'GPU')
  const ramRaw = findSpecValue(specs, 'RAM')
  const storageRaw = findSpecValue(specs, 'Storage')
  const refreshRaw = findSpecValue(specs, 'Refresh Rate')
  const batteryRaw = findSpecValue(specs, 'Battery Life')

  let storageGB = extractMaxNumber(storageRaw)
  if (storageRaw && /tb/i.test(storageRaw) && storageGB !== null) {
    storageGB = storageGB * 1000 // normalize TB to GB
  }

  return {
    cpuScore: scoreCpu(processorRaw),
    gpuScore: scoreGpu(gpuRaw),
    ramGB: extractMaxNumber(ramRaw),
    storageGB,
    refreshRateHz: extractMaxNumber(refreshRaw),
    batteryHours: extractMaxNumber(batteryRaw),
  }
}

const WEIGHTS = {
  cpu: 0.40,
  gpu: 0.25,
  ram: 0.15,
  storage: 0.10,
  display: 0.05,
  battery: 0.05,
}

export function computeLaptopSpecScore(specs: SpecRow[]): number {
  const parsed = parseLaptopSpecs(specs)

  const ramComponent = normalize(parsed.ramGB, 32)
  const storageComponent = normalize(parsed.storageGB, 1000)
  const displayComponent = normalize(parsed.refreshRateHz, 144)
  const batteryComponent = normalize(parsed.batteryHours, 15)

  const score =
    parsed.cpuScore * WEIGHTS.cpu +
    parsed.gpuScore * WEIGHTS.gpu +
    ramComponent * WEIGHTS.ram +
    storageComponent * WEIGHTS.storage +
    displayComponent * WEIGHTS.display +
    batteryComponent * WEIGHTS.battery

  return Math.round(score)
}

export function getFinalLaptopSpecScore(
  specs: SpecRow[],
  overrideScore: number | null | undefined
): number {
  if (overrideScore !== null && overrideScore !== undefined) return overrideScore
  return computeLaptopSpecScore(specs)
}
