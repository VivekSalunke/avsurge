import { getFinalSpecScore, type SpecRow } from '@/lib/specScore'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400 bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]'
  if (score >= 60) return 'text-neon-cyan bg-[rgba(6,182,212,0.1)] border-[rgba(6,182,212,0.2)]'
  if (score >= 40) return 'text-yellow-400 bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]'
  return 'text-dim bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]'
}

export default function SpecScoreBadge({
  specs,
  overrideScore,
}: {
  specs: SpecRow[]
  overrideScore?: number | null
}) {
  const score = getFinalSpecScore(specs, overrideScore)

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 mb-4 ${scoreColor(score)}`}>
      <span className="text-lg font-bold">{score}</span>
      <div className="leading-tight">
        <div className="text-xs font-semibold">AVSurge Spec Score</div>
        <div className="text-[10px] opacity-70">out of 100</div>
      </div>
    </div>
  )
}
