import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { signToken } from '@/lib/auth';
import { generateId } from '@/lib/id';
import { ok, err } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return err('Email và mật khẩu không được để trống');
    if (password.length < 6) return err('Mật khẩu tối thiểu 6 ký tự');

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) return err('Email đã được sử dụng', 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const id = generateId();
    await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${passwordHash})`;

    const token = await signToken({ userId: id, email });
    return ok({ token, user: { id, email } }, 201);
  } catch (e) {
    console.error('/auth/register', e);
    return err('Lỗi server', 500);
  }
}
