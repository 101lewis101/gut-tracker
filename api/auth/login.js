import bcrypt from 'bcryptjs';
import { sql, initDb } from '../_db.js';
import { signToken } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  await initDb();

  const rows = await sql`
    SELECT id, password_hash FROM users WHERE email = ${email.trim().toLowerCase()}
  `;
  const user = rows[0];

  // Use constant-time comparison even for missing users to prevent timing attacks
  const hashToCompare = user?.password_hash || '$2a$10$invalidhashfortimingprotection00000000000000000000';
  const ok = await bcrypt.compare(password, hashToCompare);

  if (!user || !ok) return res.status(401).json({ error: 'Invalid email or password' });

  const token = await signToken(user.id);
  return res.json({ token });
}
