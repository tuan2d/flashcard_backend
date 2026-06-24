import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { ok, err } from '@/lib/response';

type Ctx = { params: Promise<{ id: string }> };

function checkSecret(req: NextRequest): boolean {
  const secret = req.nextUrl.searchParams.get('secret');
  return !!secret && secret === process.env.SETUP_SECRET;
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

/**
 * PATCH /api/public/decks/:id?secret=xxx — merge partial update vào deck đã có
 *
 * Body: { deck?: Partial<DeckMeta>, cards?: Partial<Card>[] }
 * Merge rules:
 *   - deck fields: overwrite chỉ những field non-empty trong payload
 *   - cards: chỉ update card có ID đã tồn tại; card không có trong payload → giữ nguyên
 *   - card ID mới (không tồn tại trên server) → bỏ qua
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!checkSecret(req)) return err('Forbidden', 403);
  try {
    const { id } = await params;

    const rows = await sql`SELECT data FROM public_decks WHERE id = ${id}`;
    if (rows.length === 0) return err('Deck not found', 404);

    const existing = rows[0].data as Record<string, unknown> & { cards?: Record<string, unknown>[] };
    const { deck: deckPatch, cards: cardPatch } = await req.json() as {
      deck?: Record<string, unknown>;
      cards?: { id: string; [k: string]: unknown }[];
    };

    // Merge deck metadata — chỉ overwrite field có giá trị
    const merged = { ...existing };
    if (deckPatch) {
      for (const [k, v] of Object.entries(deckPatch)) {
        if (v !== '' && v !== null && v !== undefined) merged[k] = v;
      }
    }

    // Merge cards — chỉ update card ID đã tồn tại
    if (cardPatch && cardPatch.length > 0) {
      const cardMap = new Map((existing.cards ?? []).map((c) => [c.id as string, c]));
      for (const upd of cardPatch) {
        if (!cardMap.has(upd.id)) continue; // bỏ qua card ID mới
        const base = cardMap.get(upd.id)!;
        const updatedCard: Record<string, unknown> = { ...base };
        for (const [k, v] of Object.entries(upd)) {
          if (k !== 'id' && v !== '' && v !== null && v !== undefined) updatedCard[k] = v;
        }
        cardMap.set(upd.id, updatedCard);
      }
      merged.cards = Array.from(cardMap.values());
    }

    await sql`
      UPDATE public_decks SET data = ${JSON.stringify(merged)}, updated_at = NOW()
      WHERE id = ${id}
    `;
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('PATCH /api/public/decks/:id', e);
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
