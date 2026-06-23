import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { signToken } from '@/lib/auth';
import { ok, err } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return err('Email và mật khẩu không được để trống');

    const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
    if (rows.length === 0) return err('Email hoặc mật khẩu không đúng', 401);

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return err('Email hoặc mật khẩu không đúng', 401);

    const token = await signToken({ userId: user.id, email: user.email });
    return ok({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error('/auth/login', e);
    return err('Lỗi server', 500);
  }
}
