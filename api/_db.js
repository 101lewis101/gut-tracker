import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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
}

export { sql };
