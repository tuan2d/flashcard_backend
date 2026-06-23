import { NextRequest } from 'next/server';
import { initSchema } from '@/lib/db';
import { ok, err } from '@/lib/response';

/**
 * GET /api/setup?secret=xxx
 * Tạo tables trong Neon DB. Gọi đúng một lần sau khi deploy.
 * Bảo vệ bằng SETUP_SECRET env var.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return err('Forbidden', 403);
  }
  try {
    await initSchema();
    return ok({ message: 'Schema created successfully' });
  } catch (e) {
    console.error('/api/setup', e);
    return err('Lỗi server', 500);
  }
}
