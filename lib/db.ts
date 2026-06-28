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
  await sql`
    CREATE TABLE IF NOT EXISTS performance_events (
      id         TEXT PRIMARY KEY,
      device_id  TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload    JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_perf_device ON performance_events(device_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_perf_type ON performance_events(event_type)`;
  await sql`
    CREATE TABLE IF NOT EXISTS card_stats (
      device_id TEXT NOT NULL,
      card_id   TEXT NOT NULL,
      correct   INT  NOT NULL DEFAULT 0,
      wrong     INT  NOT NULL DEFAULT 0,
      PRIMARY KEY (device_id, card_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_card_stats_device ON card_stats(device_id)`;
}
