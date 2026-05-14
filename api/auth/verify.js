import { jwtVerify } from 'jose';
import { sql, initDb } from '../_db.js';
import { signToken } from '../_auth.js';

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-prod');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token required' });

  let payload;
  try {
    const result = await jwtVerify(token, secret());
    payload = result.payload;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired link. Please request a new one.' });
  }

  if (payload.type !== 'magic') {
    return res.status(401).json({ error: 'Invalid token type' });
  }

  const email = payload.sub;
  await initDb();

  // Find or create user
  let rows = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (rows.length === 0) {
    rows = await sql`INSERT INTO users (email) VALUES (${email}) RETURNING id`;
  }

  const sessionToken = await signToken(rows[0].id);
  return res.json({ token: sessionToken, email });
}
