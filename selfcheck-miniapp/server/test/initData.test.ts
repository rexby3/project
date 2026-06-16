import { describe, expect, it } from 'vitest';
import { signInitData, validateInitData } from '../src/telegram/initData';

const BOT_TOKEN = '123456:TEST_TOKEN_abcdefghijklmnop';

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

describe('validateInitData', () => {
  it('accepts correctly signed init data', () => {
    const initData = signInitData(
      {
        auth_date: String(nowSeconds()),
        query_id: 'AAA',
        user: JSON.stringify({ id: 42, first_name: 'Ann' }),
      },
      BOT_TOKEN,
    );

    const res = validateInitData(initData, BOT_TOKEN);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.user.id).toBe(42);
      expect(res.user.first_name).toBe('Ann');
    }
  });

  it('rejects tampered data', () => {
    const initData = signInitData(
      { auth_date: String(nowSeconds()), user: JSON.stringify({ id: 1 }) },
      BOT_TOKEN,
    );
    const tampered = initData.replace(/id%22%3A1/, 'id%22%3A999');
    const res = validateInitData(tampered, BOT_TOKEN);
    expect(res.ok).toBe(false);
  });

  it('rejects a wrong bot token', () => {
    const initData = signInitData(
      { auth_date: String(nowSeconds()), user: JSON.stringify({ id: 1 }) },
      BOT_TOKEN,
    );
    const res = validateInitData(initData, 'different:token');
    expect(res.ok).toBe(false);
  });

  it('rejects expired init data', () => {
    const old = nowSeconds() - 60 * 60 * 48; // 48h ago
    const initData = signInitData(
      { auth_date: String(old), user: JSON.stringify({ id: 1 }) },
      BOT_TOKEN,
    );
    const res = validateInitData(initData, BOT_TOKEN);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('expired');
  });

  it('rejects missing hash / empty', () => {
    expect(validateInitData('', BOT_TOKEN).ok).toBe(false);
    expect(validateInitData('user=%7B%7D&auth_date=1', BOT_TOKEN).ok).toBe(false);
  });
});
