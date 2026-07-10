'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type DeviceType = 'phone' | 'tablet' | 'laptop';

interface Device {
  id: string;
  name: string;
  slug: string;
  brand: string;
  image_url: string;
  view_count: number;
  price?: number;
}

const TABLE_MAP: Record<DeviceType, string> = {
  phone: 'phones',
  tablet: 'tablets',
  laptop: 'laptops',
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function formatViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<DeviceType>('phone');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLE_MAP[activeTab])
        .select('id, name, slug, brand, image_url, view_count, price')
        .order('view_count', { ascending: false, nullsFirst: false })
        .limit(20);

      if (!cancelled) {
        if (error) {
          console.error(error);
          setDevices([]);
        } else {
          setDevices(data || []);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab]);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Trending ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s on AVSurge`,
    description: `Most viewed ${activeTab}s ranked by popularity on AVSurge`,
    itemListElement: devices.map((device, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://avsurge.com/${activeTab}s/${device.slug}`,
      name: device.name,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {devices.length > 0 && (
        <Script
          id="leaderboard-itemlist-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      <h1 className="text-3xl font-bold mb-2">🔥 Trending Devices</h1>
      <p className="text-gray-500 mb-6">Most viewed devices on AVSurge right now</p>

      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {(['phone', 'tablet', 'laptop'] as DeviceType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading rankings...</div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No data yet for this category.</div>
      ) : (
        <div className="space-y-3">
          {devices.map((device, idx) => (
            <div
              key={device.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow bg-white"
            >
              <div className="w-10 text-center text-xl font-bold text-gray-400 shrink-0">
                {idx < 3 ? RANK_MEDALS[idx] : `#${idx + 1}`}
              </div>

              <div className="w-14 h-14 relative shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                {device.image_url && (
                  <Image
                    src={device.image_url}
                    alt={device.name}
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/${activeTab}s/${device.slug}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 truncate block"
                >
                  {device.name}
                </Link>
                <span className="text-sm text-gray-400">{device.brand}</span>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-gray-700">
                  {formatViews(device.view_count || 0)} views
                </div>
                {device.price && (
                  <div className="text-xs text-gray-400">₹{device.price.toLocaleString('en-IN')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
