import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ok, err } from '@/lib/response';

/** GET /api/sessions?deckId=xxx */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req);
    const deckId = req.nextUrl.searchParams.get('deckId');
    if (!deckId) return err('deckId là bắt buộc');

    const rows = await sql`
      SELECT data FROM sessions
      WHERE user_id = ${userId} AND deck_id = ${deckId}
      ORDER BY created_at ASC
    `;
    return ok(rows.map((r) => r.data));
  } catch (e: any) {
    if (e.message === 'Unauthorized') return err('Unauthorized', 401);
    return err('Lỗi server', 500);
  }
}

/** POST /api/sessions — lưu một session result */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req);
    const data = await req.json();
    if (!data.id || !data.deckId) return err('id và deckId là bắt buộc');

    await sql`
      INSERT INTO sessions (id, user_id, deck_id, data)
      VALUES (${data.id}, ${userId}, ${data.deckId}, ${JSON.stringify(data)})
      ON CONFLICT (id) DO NOTHING
    `;
    return new Response(null, { status: 204 });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return err('Unauthorized', 401);
    console.error('POST /api/sessions', e);
    return err('Lỗi server', 500);
  }
}
