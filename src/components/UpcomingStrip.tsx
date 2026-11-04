import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_LABELS, devicePath, type UpcomingLaunch } from '@/lib/upcoming'

/** "12" and "Nov" from YYYY-MM-DD */
function dayAndMonth(date: string): { day: string; month: string } {
  const d = new Date(`${date}T00:00:00Z`)
  return {
    day: d.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' }),
  }
}

function StripCard({ item }: { item: UpcomingLaunch }) {
  const { day, month } = dayAndMonth(item.launch_date)
  const expected = item.date_status === 'expected'
  const accent = expected ? '#fbbf24' : '#22d3ee'

  return (
    <Link
      href={devicePath(item) ?? '/upcoming'}
      className="group flex h-full items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[var(--card-bg)] p-4 transition-all duration-300 card-hover hover:border-[rgba(6,182,212,0.35)] hover:glow"
    >
      {/* Date block */}
      <div
        className="flex h-16 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl border"
        style={{ borderColor: `${accent}55`, background: `${accent}14` }}
      >
        <span className="text-xl font-extrabold leading-none text-white">{day}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-dim">
          {item.brand} · {CATEGORY_LABELS[item.category]}
        </div>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-white transition-colors group-hover:text-neon-cyan">
          {item.name}
        </h3>
        {item.expected_price_note ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[rgba(255,255,255,0.6)]">{item.expected_price_note}</p>
        ) : item.highlights.length > 0 ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[rgba(255,255,255,0.6)]">{item.highlights.slice(0, 2).join(' · ')}</p>
        ) : null}
        {expected && (
          <span
            className="mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide"
            style={{ borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' }}
          >
            Expected
          </span>
        )}
      </div>

      {item.image_url && (
        <div className="relative hidden h-16 w-12 flex-shrink-0 sm:block">
          <Image src={item.image_url} alt={item.name} fill unoptimized sizes="48px" className="object-contain" />
        </div>
      )}
    </Link>
  )
}

export default function UpcomingStrip({ items }: { items: UpcomingLaunch[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map(item => <StripCard key={item.id} item={item} />)}
    </div>
  )
}
