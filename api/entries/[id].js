import { sql } from '../_db.js';
import { verifyToken, getToken } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  let userId;
  try { userId = await verifyToken(token); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  const { id } = req.query;
  await sql`DELETE FROM entries WHERE id = ${id} AND user_id = ${userId}`;
  res.json({ ok: true });
}
