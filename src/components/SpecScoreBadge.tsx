import { getFinalSpecScore, type SpecRow } from '@/lib/specScore'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-gray-600 bg-gray-50 border-gray-200'
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
