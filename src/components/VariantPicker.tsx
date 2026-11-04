'use client'
import { useState } from 'react'
import { formatPriceINR } from '@/lib/format'
import { buildAmazonSearchUrl, buildFlipkartSearchUrl, withAmazonTag } from '@/lib/affiliate'
import { DeviceVariant, STORE_LABELS, formatVariantLabel } from '@/lib/variants'

function buyUrl(deviceName: string, v: DeviceVariant): string {
  if (v.store_url) return v.store === 'amazon' ? withAmazonTag(v.store_url) : v.store_url
  const conn = v.connectivity === 'cellular' ? ' Cellular' : v.connectivity === 'wifi' ? ' WiFi' : ''
  const query = `${deviceName} ${v.ram_gb}GB ${v.storage_gb}GB${conn}`
  return v.store === 'amazon' ? buildAmazonSearchUrl(query) : buildFlipkartSearchUrl(query)
}

export default function VariantPicker({
  deviceName,
  variants,
}: {
  deviceName: string
  /** Already sorted, cheapest first */
  variants: DeviceVariant[]
}) {
  const [selectedId, setSelectedId] = useState(variants[0].id)
  const selected = variants.find(v => v.id === selectedId) ?? variants[0]
  const otherStore = selected.store === 'amazon' ? 'flipkart' : 'amazon'
  const otherStoreUrl = otherStore === 'amazon'
    ? buildAmazonSearchUrl(deviceName)
    : buildFlipkartSearchUrl(deviceName)

  return (
    <div className="mb-4">
      <div className="price-tag rounded-xl px-4 py-3 mb-3 text-center">
        <div className="text-xs mb-0.5" style={{ color: '#22d3ee' }}>
          Price in India · {formatVariantLabel(selected.ram_gb, selected.storage_gb, selected.connectivity)}
        </div>
        <div className="text-2xl font-bold" style={{ color: '#22d3ee' }}>{formatPriceINR(selected.price_inr)}</div>
      </div>

      {variants.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3" role="radiogroup" aria-label="Choose a variant">
          {variants.map(v => {
            const active = v.id === selected.id
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedId(v.id)}
                className="flex-1 min-w-[45%] rounded-lg border px-2 py-1.5 text-xs transition text-left"
                style={
                  active
                    ? { borderColor: '#06b6d4', background: 'rgba(6,182,212,0.12)', color: '#ffffff' }
                    : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.7)' }
                }
              >
                <div className="font-semibold">{formatVariantLabel(v.ram_gb, v.storage_gb, v.connectivity)}</div>
                <div style={{ color: active ? '#22d3ee' : 'rgba(255,255,255,0.45)' }}>{formatPriceINR(v.price_inr)}</div>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <a
          href={buyUrl(deviceName, selected)}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-center text-black transition hover:brightness-110"
          style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
        >
          Buy on {STORE_LABELS[selected.store]} →
        </a>
        <a
          href={otherStoreUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="w-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.85)] rounded-xl py-2.5 text-sm font-medium transition text-center hover:text-white"
        >
          Check on {STORE_LABELS[otherStore]} →
        </a>
      </div>
    </div>
  )
}
