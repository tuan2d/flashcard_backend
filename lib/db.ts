import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);
export default sql;

/** Run once to initialise schema. Call from /api/setup route or manually. */
export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS decks (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deck_id     TEXT NOT NULL,
      data        JSONB NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS public_decks (
      id         TEXT PRIMARY KEY,
      data       JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
