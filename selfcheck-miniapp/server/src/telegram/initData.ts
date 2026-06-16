import crypto from 'node:crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export type InitDataResult =
  | { ok: true; user: TelegramUser; authDate: number }
  | { ok: false; error: string };

/**
 * Validate Telegram Mini App `initData` per the official algorithm:
 *   secret_key      = HMAC_SHA256(key="WebAppData", message=bot_token)
 *   calculated_hash = HMAC_SHA256(key=secret_key, message=data_check_string)
 * where data_check_string is the '\n'-joined, key-sorted "key=value" pairs
 * (decoded values), excluding `hash`.
 *
 * This is what proves *which Telegram user* is calling us — the basis for
 * tying an ownership-verification to a real account.
 */
export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
): InitDataResult {
  if (!initData) return { ok: false, error: 'empty_init_data' };
  if (!botToken) return { ok: false, error: 'server_misconfigured_no_bot_token' };

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return { ok: false, error: 'malformed_init_data' };
  }

  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'missing_hash' };

  const pairs: string[] = [];
  for (const [key, value] of params) {
    if (key === 'hash') continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: 'bad_hash' };
  }

  const authDate = Number(params.get('auth_date') ?? '0');
  if (!authDate || Number.isNaN(authDate)) return { ok: false, error: 'missing_auth_date' };
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds) return { ok: false, error: 'expired' };

  const userRaw = params.get('user');
  if (!userRaw) return { ok: false, error: 'missing_user' };

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    return { ok: false, error: 'bad_user_json' };
  }
  if (!user || typeof user.id !== 'number') return { ok: false, error: 'missing_user_id' };

  return { ok: true, user, authDate };
}

/**
 * Helper used by tests and tooling: build a correctly-signed initData string.
 * Never use this on the client — the bot token must stay server-side.
 */
export function signInitData(
  fields: Record<string, string>,
  botToken: string,
): string {
  const entries = Object.entries(fields);
  const dataCheckString = entries
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const params = new URLSearchParams(fields);
  params.set('hash', hash);
  return params.toString();
}
