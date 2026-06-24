import sql from '@/lib/db';
import { ok, err } from '@/lib/response';

/** GET /api/public/decks — trả về tất cả public decks, không cần auth */
export async function GET() {
  try {
    const rows = await sql`SELECT data FROM public_decks ORDER BY updated_at ASC`;
    return ok(rows.map((r) => r.data));
  } catch (e) {
    console.error('GET /api/public/decks', e);
    return err('Lỗi server', 500);
  }
}
