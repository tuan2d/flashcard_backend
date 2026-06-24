import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { ok, err } from '@/lib/response';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * POST /api/performance/events — ghi performance event từ app
 * Body: { id, device_id, event_type, payload, created_at }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, device_id, event_type, payload, created_at } = body;

    if (!id || !device_id || !event_type || !payload) {
      return err('Missing required fields', 400);
    }

    await sql`
      INSERT INTO performance_events (id, device_id, event_type, payload, created_at)
      VALUES (
        ${id},
        ${device_id},
        ${event_type},
        ${JSON.stringify(payload)},
        ${created_at ?? new Date().toISOString()}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('POST /api/performance/events', e);
    return err('Lỗi server', 500);
  }
}
