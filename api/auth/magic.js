import { SignJWT } from 'jose';
import { sql, initDb } from '../_db.js';

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-prod');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  await initDb();

  const normalizedEmail = email.trim().toLowerCase();

  const token = await new SignJWT({ sub: normalizedEmail, type: 'magic' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret());

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const link = `${proto}://${host}/?magic=${token}`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: normalizedEmail,
      subject: 'Sign in to Gut',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:40px 20px">
          <h2 style="margin:0 0 8px">Gut tracker</h2>
          <p style="color:#666;margin:0 0 28px">Click the button below to sign in. This link expires in 15 minutes.</p>
          <a href="${link}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Sign in to Gut</a>
          <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  return res.json({ ok: true });
}
