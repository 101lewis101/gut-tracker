import { sql, initDb } from '../_db.js';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM entries ORDER BY ts DESC`;
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const e = req.body;
    await sql`
      INSERT INTO entries (id, kind, ts, names, notes, photo_url, bristol, urgency, symptom_type, severity)
      VALUES (
        ${e.id}, ${e.kind}, ${e.ts},
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
    await sql`DELETE FROM entries`;
    return res.json({ ok: true });
  }

  res.status(405).end();
}
