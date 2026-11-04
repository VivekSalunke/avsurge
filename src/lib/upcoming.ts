export type UpcomingCategory = 'phone' | 'tablet' | 'laptop'

/** confirmed = brand announced the exact Indian date; expected = date from reports, brand only teased */
export type DateStatus = 'confirmed' | 'expected'

export interface UpcomingLaunch {
  id: number
  name: string
  brand: string
  category: UpcomingCategory
  /** Indian launch date, YYYY-MM-DD (see date_status) */
  launch_date: string
  date_status: DateStatus
  /** Official teaser / press release / event page confirming the date */
  source_url: string
  expected_price_note: string | null
  image_url: string | null
  highlights: string[]
  /** Set after launch, once the real device page exists */
  device_slug: string | null
}

export const CATEGORY_LABELS: Record<UpcomingCategory, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  laptop: 'Laptop',
}

/** How long a launched device stays in "Recently launched" */
export const RECENT_DAYS = 14

/** Today's date in India as YYYY-MM-DD */
export function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

/** YYYY-MM-DD shifted by `days` */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** "12 Nov 2026" */
export function formatLaunchDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
}

/** "November 2026" */
export function monthLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** Link to the launched device's spec page */
export function devicePath(item: Pick<UpcomingLaunch, 'category' | 'device_slug'>): string | null {
  return item.device_slug ? `/${item.category}s/${item.device_slug}` : null
}
