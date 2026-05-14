import { sql } from '../_db.js';
import { verifyToken, getToken } from '../_auth.js';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

async function authenticate(req, res) {
  const token = getToken(req);
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  try { return await verifyToken(token); }
  catch { res.status(401).json({ error: 'Invalid token' }); return null; }
}

export default async function handler(req, res) {
  const userId = await authenticate(req, res);
  if (!userId) return;

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT * FROM entries WHERE user_id = ${userId} ORDER BY ts DESC
    `;
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const e = req.body;
    await sql`
      INSERT INTO entries (id, user_id, kind, ts, names, notes, photo_url, bristol, urgency, symptom_type, severity)
      VALUES (
        ${e.id}, ${userId}, ${e.kind}, ${e.ts},
        ${e.names ? JSON.stringify(e.names) : null},
        ${e.notes || ''},
        ${e.photo_url || null},
        ${e.bristol || null},
        ${e.urgency ?? null},
        ${e.symptom_type || null},
        ${e.severity || null}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    return res.status(201).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    // Bulk delete all entries for this user
    await sql`DELETE FROM entries WHERE user_id = ${userId}`;
    return res.json({ ok: true });
  }

  res.status(405).end();
}
