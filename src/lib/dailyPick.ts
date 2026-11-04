import { todayIST } from '@/lib/upcoming'

/** Small string hash (FNV-1a), good enough for shuffling */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Picks `count` items that stay the same all day (India time) and change the next day.
 * Items with an image are preferred; falls back to the rest if there aren't enough.
 * `salt` keeps different lists (phones, tablets) from getting the same shuffle.
 */
export function dailyPick<T extends { id: number; image_url?: string | null }>(
  items: T[],
  count: number,
  salt: string,
  date: string = todayIST(),
): T[] {
  const shuffled = [...items].sort((a, b) => hash(`${date}:${salt}:${a.id}`) - hash(`${date}:${salt}:${b.id}`))
  const withImage = shuffled.filter(i => i.image_url)
  const withoutImage = shuffled.filter(i => !i.image_url)
  return [...withImage, ...withoutImage].slice(0, count)
}
