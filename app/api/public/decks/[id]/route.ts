import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { ok, err } from '@/lib/response';

type Ctx = { params: Promise<{ id: string }> };

const VALID_SECRETS = new Set([
  process.env.ADMIN_SECRET,
  process.env.SETUP_SECRET,
].filter(Boolean));

function checkSecret(req: NextRequest): boolean {
  const secret = req.nextUrl.searchParams.get('secret');
  return !!secret && VALID_SECRETS.has(secret);
}

/** PUT /api/public/decks/:id?secret=xxx — upsert deck vào public pool */
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!checkSecret(req)) return err('Forbidden', 403);
  try {
    const { id } = await params;
    const data = await req.json();
    await sql`
      INSERT INTO public_decks (id, data, updated_at)
      VALUES (${id}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW()
    `;
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('PUT /api/public/decks/:id', e);
    return err('Lỗi server', 500);
  }
}

/** DELETE /api/public/decks/:id?secret=xxx — xóa deck khỏi public pool */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!checkSecret(req)) return err('Forbidden', 403);
  try {
    const { id } = await params;
    await sql`DELETE FROM public_decks WHERE id = ${id}`;
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/public/decks/:id', e);
    return err('Lỗi server', 500);
  }
}
