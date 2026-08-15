import Link from 'next/link'

function formatPriceINR(price: number | null): string {
  if (!price) return 'Price unavailable'

  return `₹${price.toLocaleString('en-IN')}`
}

export interface DeviceCardProps {
  device: {
    id: string | number
    slug: string
    name: string
    brand: string
    price_inr: number | null
    image_url: string | null
  }
  type: 'phone' | 'tablet' | 'laptop'
  score?: number | null
}

function getScoreStyle(score: number) {
  if (score >= 90) {
    return {
      badge: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200 shadow-sm',
      label: 'Excellent',
      icon: '⭐',
    }
  }

  if (score >= 80) {
    return {
      badge: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 ring-1 ring-green-200 shadow-sm',
      label: 'Very Good',
      icon: '✨',
    }
  }

  if (score >= 70) {
    return {
      badge: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200 shadow-sm',
      label: 'Good',
      icon: '👍',
    }
  }

  if (score >= 60) {
    return {
      badge: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 ring-1 ring-amber-200 shadow-sm',
      label: 'Decent',
      icon: '👌',
    }
  }

  return {
    badge: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 ring-1 ring-gray-200 shadow-sm',
    label: 'Basic',
    icon: '📱',
  }
}

export default function DeviceCard({
  device,
  type,
  score,
}: DeviceCardProps) {
  const compareHref =
    type === 'phone'
      ? '/compare'
      : type === 'tablet'
        ? '/compare-tablets'
        : '/compare-laptops'

  const scoreStyle =
    score !== null && score !== undefined
      ? getScoreStyle(score)
      : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl">

      {/* Product Image */}
      <Link
        href={`/${type}s/${device.slug}`}
        className="relative block aspect-[4/4.5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
      >
        {/* Subtle image-area decoration */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.08),transparent_60%)]" />

        {device.image_url ? (
          <img
            src={device.image_url}
            alt={device.name}
            loading="lazy"
            className="relative h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-center text-xs font-medium text-gray-400">
              <div className="text-lg mb-1">📸</div>
              <div>No image</div>
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-4">

        {/* Brand Badge */}
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          {device.brand}
        </div>

        {/* Name */}
        <Link
          href={`/${type}s/${device.slug}`}
          className="mt-2.5 block flex-1"
        >
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
            {device.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-3 space-y-1">
          {device.price_inr ? (
            <>
              <p className="text-lg font-extrabold tracking-tight text-gray-900">
                {formatPriceINR(device.price_inr)}
              </p>

              <span className="text-[10px] font-medium text-gray-400">
                Starting price
              </span>
            </>
          ) : (
            <p className="text-xs font-medium text-gray-400">
              Price on request
            </p>
          )}
        </div>

        {/* Bottom section */}
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">

          {/* AVSurge Score */}
          {scoreStyle && score !== null && score !== undefined ? (
            <div className="flex items-center gap-2.5">

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-extrabold text-base ${scoreStyle.badge}`}
              >
                {score}
              </div>

              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-[11px] font-semibold text-gray-600">
                  AVSurge Score
                </div>

                <div className="text-[10px] font-medium text-gray-400">
                  {scoreStyle.icon} {scoreStyle.label}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">
                ?
              </div>
              <span className="text-[11px] font-medium text-gray-500">
                Score unavailable
              </span>
            </div>
          )}

          {/* Action Button */}
          <Link
            href={`${compareHref}?a=${device.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M7 18c-1.26 0-2-1-2-2V7M17 6c1.26 0 2 1 2 2v9M9 10l6-6M9 10h6M9 10v6M15 10v6" />
            </svg>
            Compare
          </Link>

        </div>
      </div>
    </article>
  )
}
