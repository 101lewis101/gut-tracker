import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('food', 'bowel', 'symptom')),
      ts BIGINT NOT NULL,
      names JSONB,
      notes TEXT DEFAULT '',
      photo_url TEXT,
      bristol INT,
      urgency INT,
      symptom_type TEXT,
      severity INT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Drop user_id column if migrating from auth version
  await sql`ALTER TABLE entries DROP COLUMN IF EXISTS user_id`.catch(() => {});
}

export { sql };
