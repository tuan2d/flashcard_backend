import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ok, err } from '@/lib/response';

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/decks/:id */
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const { userId } = await requireAuth(req);
    const { id } = await params;
    const rows = await sql`SELECT data FROM decks WHERE id = ${id} AND user_id = ${userId}`;
    if (rows.length === 0) return err('Not found', 404);
    return ok(rows[0].data);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return err('Unauthorized', 401);
    return err('Lỗi server', 500);
  }
}

/** PUT /api/decks/:id — upsert (tạo mới hoặc cập nhật) */
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { userId } = await requireAuth(req);
    const { id } = await params;
    const data = await req.json();

    await sql`
      INSERT INTO decks (id, user_id, data, updated_at)
      VALUES (${id}, ${userId}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW()
        WHERE decks.user_id = ${userId}
    `;
    return new Response(null, { status: 204 });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return err('Unauthorized', 401);
    console.error('PUT /api/decks/:id', e);
    return err('Lỗi server', 500);
  }
}

/** DELETE /api/decks/:id */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const { userId } = await requireAuth(req);
    const { id } = await params;
    await sql`DELETE FROM decks WHERE id = ${id} AND user_id = ${userId}`;
    return new Response(null, { status: 204 });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return err('Unauthorized', 401);
    return err('Lỗi server', 500);
  }
}
