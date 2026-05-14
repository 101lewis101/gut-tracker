import { SignJWT, jwtVerify } from 'jose';

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-prod');
}

export async function signToken(userId) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload.sub;
}

export function getToken(req) {
  const auth = req.headers['authorization'] || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}
