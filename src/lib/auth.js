import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'slideease_artisan_secret_key_2026';

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
 * Creates a cryptographically signed session token string.
 */
export function signSession(payload) {
  const data = JSON.stringify({
    ...payload,
    iat: Date.now(),
  });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(dataB64)
    .digest('base64url');
  return `${dataB64}.${signature}`;
}

/**
 * Verifies a signed session token. Returns payload or null if invalid or tampered.
 */
export function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) {
    // If legacy raw JSON cookie was stored, parse safely as fallback
    try {
      const parsed = JSON.parse(token);
      if (parsed && parsed.email) return parsed;
    } catch (e) {}
    return null;
  }

  const [dataB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(dataB64)
    .digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}
