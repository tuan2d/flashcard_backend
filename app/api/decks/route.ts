import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ok, err } from '@/lib/response';

/** GET /api/decks — trả về tất cả deck của user */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req);
    const rows = await sql`SELECT data FROM decks WHERE user_id = ${userId} ORDER BY updated_at ASC`;
    return ok(rows.map((r) => r.data));
  } catch (e: any) {
    if (e.message === 'Unauthorized') return err('Unauthorized', 401);
    console.error('GET /api/decks', e);
    return err('Lỗi server', 500);
  }
}
