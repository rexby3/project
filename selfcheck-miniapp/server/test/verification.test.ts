import { beforeEach, describe, expect, it } from 'vitest';
import { generateCode, hashCode } from '../src/verification/codes';
import {
  _resetStore,
  isVerified,
  putPendingCode,
  verifyCode,
} from '../src/verification/store';

const SALT = 'test-salt';

function seed(userId: number, channel: 'email' | 'phone', target: string, code: string, ttl = 600) {
  putPendingCode(userId, channel, target, hashCode(code, SALT), ttl);
}

describe('ownership verification flow', () => {
  beforeEach(() => _resetStore());

  it('verifies with the correct code and then reports verified', () => {
    seed(1, 'email', 'a@b.com', '123456');
    expect(isVerified(1, 'email', 'a@b.com')).toBe(false);

    const outcome = verifyCode({
      tgUserId: 1,
      channel: 'email',
      target: 'a@b.com',
      code: '123456',
      salt: SALT,
      maxAttempts: 5,
      verifiedTtlSeconds: 600,
    });
    expect(outcome).toBe('ok');
    expect(isVerified(1, 'email', 'a@b.com')).toBe(true);
  });

  it('does not verify a different user / target', () => {
    seed(1, 'email', 'a@b.com', '123456');
    verifyCode({
      tgUserId: 1, channel: 'email', target: 'a@b.com', code: '123456',
      salt: SALT, maxAttempts: 5, verifiedTtlSeconds: 600,
    });
    expect(isVerified(2, 'email', 'a@b.com')).toBe(false);
    expect(isVerified(1, 'phone', 'a@b.com')).toBe(false);
  });

  it('rejects wrong codes and enforces max attempts', () => {
    seed(1, 'phone', '+15551234567', '000111');
    const args = {
      tgUserId: 1, channel: 'phone' as const, target: '+15551234567', code: '999999',
      salt: SALT, maxAttempts: 2, verifiedTtlSeconds: 600,
    };
    expect(verifyCode(args)).toBe('mismatch');
    expect(verifyCode(args)).toBe('mismatch');
    expect(verifyCode(args)).toBe('too_many_attempts');
  });

  it('reports no_pending when nothing was requested', () => {
    const outcome = verifyCode({
      tgUserId: 9, channel: 'email', target: 'x@y.com', code: '123456',
      salt: SALT, maxAttempts: 5, verifiedTtlSeconds: 600,
    });
    expect(outcome).toBe('no_pending');
  });

  it('generateCode returns a 6-digit string', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).toMatch(/^\d{6}$/);
    }
  });
});
