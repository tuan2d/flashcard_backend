import { NextRequest } from 'next/server';
import sql from '../../../lib/db';

function err(msg: string, status = 400) {
  return Response.json({ message: msg }, { status });
}

// POST /api/card-stats  { device_id, card_id, correct: boolean }
export async function POST(req: NextRequest) {
  const { device_id, card_id, correct } = await req.json();
  if (!device_id || !card_id || correct === undefined) return err('Missing fields');

  if (correct) {
    await sql`
      INSERT INTO card_stats (device_id, card_id, correct, wrong)
      VALUES (${device_id}, ${card_id}, 1, 0)
      ON CONFLICT (device_id, card_id)
      DO UPDATE SET correct = card_stats.correct + 1
    `;
  } else {
    await sql`
      INSERT INTO card_stats (device_id, card_id, correct, wrong)
      VALUES (${device_id}, ${card_id}, 0, 1)
      ON CONFLICT (device_id, card_id)
      DO UPDATE SET wrong = card_stats.wrong + 1
    `;
  }
  return new Response(null, { status: 204 });
}

// GET /api/card-stats?device_id=xxx
export async function GET(req: NextRequest) {
  const device_id = req.nextUrl.searchParams.get('device_id');
  if (!device_id) return err('Missing device_id');

  const rows = await sql`
    SELECT card_id, correct, wrong FROM card_stats WHERE device_id = ${device_id}
  `;
  const stats: Record<string, { correct: number; wrong: number }> = {};
  for (const r of rows) {
    stats[r.card_id] = { correct: r.correct, wrong: r.wrong };
  }
  return Response.json(stats);
}
