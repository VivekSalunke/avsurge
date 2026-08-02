import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DeviceType = 'phone' | 'tablet' | 'laptop';

const RPC_MAP: Record<DeviceType, string> = {
  phone: 'increment_phone_views',
  tablet: 'increment_tablet_views',
  laptop: 'increment_laptop_views',
};

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { deviceType, deviceId } = await req.json();

    if (!deviceType || !deviceId || !RPC_MAP[deviceType as DeviceType]) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitKey = `${ip}:${deviceType}:${deviceId}`;
    const lastHit = rateLimitMap.get(rateLimitKey);
    const now = Date.now();

    if (lastHit && now - lastHit < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json({ skipped: true }, { status: 200 });
    }
    rateLimitMap.set(rateLimitKey, now);

    const rpcName = RPC_MAP[deviceType as DeviceType];
    const idColumn = deviceType === 'phone' ? 'phone_id' : deviceType === 'tablet' ? 'tablet_id' : 'laptop_id';

    const { error } = await supabaseAdmin.rpc(rpcName, { [idColumn]: deviceId });

    if (error) {
      console.error('track-view RPC error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('track-view error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
