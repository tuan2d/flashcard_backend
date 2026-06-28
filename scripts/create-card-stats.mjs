import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL);

await sql`CREATE TABLE IF NOT EXISTS card_stats (
  device_id TEXT NOT NULL,
  card_id   TEXT NOT NULL,
  correct   INT  NOT NULL DEFAULT 0,
  wrong     INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (device_id, card_id)
)`;
await sql`CREATE INDEX IF NOT EXISTS idx_card_stats_device ON card_stats(device_id)`;
console.log('card_stats table ready');
