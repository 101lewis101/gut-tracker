import bcrypt from 'bcryptjs';
import { sql, initDb } from '../_db.js';
import { signToken } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  await initDb();

  const hash = await bcrypt.hash(password, 10);
  try {
    const rows = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email.trim().toLowerCase()}, ${hash})
      RETURNING id
    `;
    const token = await signToken(rows[0].id);
    return res.status(201).json({ token });
  } catch (e) {
    if (e.message?.includes('unique') || e.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    throw e;
  }
}
