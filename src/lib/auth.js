import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL SECURITY CONFIGURATION ERROR: SESSION_SECRET is not set in production.');
}
const EFFECTIVE_SECRET = SESSION_SECRET || 'slideease_artisan_secret_key_2026_dev_fallback';

/**
 * Hashes a plaintext password using bcryptjs with salt rounds 10.
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares plaintext password with stored hash (supports bcrypt and fallback SHA256).
 */
export async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  // If bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (storedHash.startsWith('$2')) {
    return await bcrypt.compare(password, storedHash);
  }
  // Fallback for legacy SHA256 hashes
  const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
  return legacyHash === storedHash;
}

/**
 * Creates a cryptographically signed session token string with 7-day expiration.
 */
export function signSession(payload) {
  const iat = Date.now();
  const exp = payload.exp || (iat + 7 * 24 * 60 * 60 * 1000); // 7 days default
  const data = JSON.stringify({
    ...payload,
    iat,
    exp,
  });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', EFFECTIVE_SECRET)
    .update(dataB64)
    .digest('base64url');
  return `${dataB64}.${signature}`;
}

/**
 * Verifies a signed session token. Returns payload or null if invalid, expired, or tampered.
 * Uses timingSafeEqual to protect against timing attacks.
 */
export function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) {
    // If legacy raw JSON cookie was stored in older dev passes, parse safely as fallback
    try {
      const parsed = JSON.parse(token);
      if (parsed && (parsed.email || parsed.role)) return parsed;
    } catch (e) {}
    return null;
  }

  const [dataB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', EFFECTIVE_SECRET)
    .update(dataB64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    // Verify token expiration
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
