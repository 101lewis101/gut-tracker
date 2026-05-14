import { sql } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { id } = req.query;
  await sql`DELETE FROM entries WHERE id = ${id}`;
  res.json({ ok: true });
}
