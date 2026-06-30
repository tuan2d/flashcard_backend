import sql from '@/lib/db';
import { ok, err } from '@/lib/response';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/** GET /api/public/decks — trả về tất cả public decks, không cần auth */
export async function GET() {
  try {
    const rows = await sql`SELECT id, data FROM public_decks ORDER BY updated_at ASC`;
    return ok(rows.map((r) => ({ id: r.id, ...r.data })));
  } catch (e) {
    console.error('GET /api/public/decks', e);
    return err('Lỗi server', 500);
  }
}
