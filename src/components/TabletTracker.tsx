'use client'

import { useEffect } from 'react'

export default function TabletTracker({ deviceId }: { deviceId: string }) {
  useEffect(() => {
    if (!deviceId) return
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceType: 'tablet', deviceId }),
    }).catch(() => {})
  }, [deviceId])

  return null
}
