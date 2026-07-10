'use client'

import { useEffect } from 'react'

export default function PhoneTracker({ deviceId }: { deviceId: string }) {
  useEffect(() => {
    if (!deviceId) return
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceType: 'phone', deviceId }),
    }).catch(() => {})
  }, [deviceId])

  return null
}
