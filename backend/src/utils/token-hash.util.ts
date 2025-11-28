import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * Hash a share token using SHA-256 + HMAC with server secret
 * This ensures tokens cannot be reverse-engineered even if database is compromised
 */
export function hashToken(token: string, hmacSecret: string): string {
  return createHmac('sha256', hmacSecret).update(token).digest('hex');
}

/**
 * Verify a token against a stored hash
 */
export function verifyToken(token: string, hash: string, hmacSecret: string): boolean {
  const computedHash = hashToken(token, hmacSecret);
  return computedHash === hash;
}

