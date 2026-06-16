import type { Channel } from '../lib/validate';
import { hashCode, safeEqualHex } from './codes';

interface PendingCode {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

interface VerifiedEntry {
  verifiedAt: number;
  expiresAt: number;
}

// In-memory state. For multi-instance production, back these with Redis.
const pending = new Map<string, PendingCode>();
const verified = new Map<string, VerifiedEntry>();

function key(tgUserId: number, channel: Channel, target: string): string {
  return `${tgUserId}:${channel}:${target}`;
}

export function putPendingCode(
  tgUserId: number,
  channel: Channel,
  target: string,
  codeHash: string,
  ttlSeconds: number,
): void {
  const now = Date.now();
  pending.set(key(tgUserId, channel, target), {
    codeHash,
    expiresAt: now + ttlSeconds * 1000,
    attempts: 0,
    createdAt: now,
  });
}

export type VerifyOutcome = 'ok' | 'no_pending' | 'expired' | 'too_many_attempts' | 'mismatch';

export function verifyCode(args: {
  tgUserId: number;
  channel: Channel;
  target: string;
  code: string;
  salt: string;
  maxAttempts: number;
  verifiedTtlSeconds: number;
}): VerifyOutcome {
  const k = key(args.tgUserId, args.channel, args.target);
  const entry = pending.get(k);
  if (!entry) return 'no_pending';

  const now = Date.now();
  if (now > entry.expiresAt) {
    pending.delete(k);
    return 'expired';
  }
  if (entry.attempts >= args.maxAttempts) {
    pending.delete(k);
    return 'too_many_attempts';
  }

  entry.attempts += 1;
  const matches = safeEqualHex(entry.codeHash, hashCode(args.code, args.salt));
  if (!matches) return 'mismatch';

  pending.delete(k);
  verified.set(k, {
    verifiedAt: now,
    expiresAt: now + args.verifiedTtlSeconds * 1000,
  });
  return 'ok';
}

export function isVerified(tgUserId: number, channel: Channel, target: string): boolean {
  const k = key(tgUserId, channel, target);
  const entry = verified.get(k);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    verified.delete(k);
    return false;
  }
  return true;
}

/** For tests. */
export function _resetStore(): void {
  pending.clear();
  verified.clear();
}
