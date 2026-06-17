'use client'
import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const raw = localStorage.getItem('recently_viewed')
    const slugs: string[] = raw ? JSON.parse(raw) : []
    const updated = [slug, ...slugs.filter(s => s !== slug)].slice(0, 10)
    localStorage.setItem('recently_viewed', JSON.stringify(updated))
  }, [slug])

  return null
}
