import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const OG_SIZE = { width: 1200, height: 630 }

export interface DeviceOgData {
  name: string
  brand: string | null
  priceInr: number | null
  score: number | null
  imageUrl: string | null
  category: 'Phone' | 'Tablet' | 'Laptop'
}

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Geist-Regular.ttf')),
  readFile(join(process.cwd(), 'assets/fonts/Geist-Bold.ttf')),
])

const logoPromise = readFile(join(process.cwd(), 'assets/og-logo.png'))
  .then(buf => `data:image/png;base64,${buf.toString('base64')}`)

// next/og can only draw PNG and JPEG, so fetch the device photo ourselves,
// check its type, and embed it as a data URL. Anything else (WebP, a slow
// CDN, a 404) falls back to a placeholder instead of breaking the image.
async function loadDeviceImage(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const type = (res.headers.get('content-type') || '').split(';')[0].trim()
    if (type !== 'image/png' && type !== 'image/jpeg') return null
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${type};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

function scoreColors(score: number) {
  if (score >= 80) return { fg: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' }
  if (score >= 60) return { fg: '#22d3ee', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.35)' }
  if (score >= 40) return { fg: '#facc15', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' }
  return { fg: '#a1a1aa', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)' }
}

// A plain outline instead of an emoji: emoji make next/og download
// graphics from a CDN at render time, which can fail.
function DevicePlaceholder({ category }: { category: DeviceOgData['category'] }) {
  const line = '6px solid rgba(255,255,255,0.18)'
  if (category === 'Laptop') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: 300, height: 190, border: line, borderRadius: 14 }} />
        <div style={{ display: 'flex', width: 360, height: 18, background: 'rgba(255,255,255,0.18)', borderRadius: 9, marginTop: 6 }} />
      </div>
    )
  }
  const tablet = category === 'Tablet'
  return (
    <div
      style={{
        display: 'flex',
        width: tablet ? 260 : 180,
        height: 340,
        border: line,
        borderRadius: tablet ? 24 : 32,
      }}
    />
  )
}

export async function renderDeviceOgImage(device: DeviceOgData): Promise<ImageResponse> {
  const [[regular, bold], logo, photo] = await Promise.all([
    fontsPromise,
    logoPromise,
    loadDeviceImage(device.imageUrl),
  ])

  const nameSize = device.name.length > 32 ? 56 : device.name.length > 22 ? 64 : 76
  const colors = device.score !== null ? scoreColors(device.score) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #0a0a0c 0%, #0f1a26 60%, #152030 100%)',
          fontFamily: 'Geist',
          color: '#ffffff',
          padding: 56,
        }}
      >
        {/* Device photo */}
        <div
          style={{
            width: 440,
            height: 518,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 32,
            flexShrink: 0,
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" style={{ maxWidth: 380, maxHeight: 460, objectFit: 'contain' }} />
          ) : (
            <DevicePlaceholder category={device.category} />
          )}
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 56,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>
              {device.brand ? `${device.brand} · ${device.category}` : device.category}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: nameSize,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1.5,
              }}
            >
              {device.name}
            </div>

            {device.priceInr ? (
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 32 }}>
                <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.5)' }}>
                  Starting price in India
                </div>
                <div style={{ display: 'flex', fontSize: 60, fontWeight: 700, color: '#22d3ee' }}>
                  {`₹${device.priceInr.toLocaleString('en-IN')}`}
                </div>
              </div>
            ) : null}

            {colors && device.score !== null ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 24,
                  alignSelf: 'flex-start',
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 20,
                  padding: '12px 22px',
                }}
              >
                <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, color: colors.fg }}>
                  {String(device.score)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 14 }}>
                  <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: colors.fg }}>
                    AVSurge Spec Score
                  </div>
                  <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>
                    out of 100
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={52} height={52} style={{ borderRadius: 12 }} />
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, marginLeft: 14 }}>avsurge.com</div>
            <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.45)', marginLeft: 18 }}>
              Full specs · Price · Compare
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Geist', data: regular, style: 'normal', weight: 400 },
        { name: 'Geist', data: bold, style: 'normal', weight: 700 },
      ],
    }
  )
}
