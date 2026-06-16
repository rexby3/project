import type { FastifyRequest } from 'fastify';
import type { Config } from '../config';
import { validateInitData, type TelegramUser } from './initData';

export type AuthResult =
  | { ok: true; user: TelegramUser }
  | { ok: false; status: number; error: string };

/**
 * Authenticate a Mini App request.
 *
 * Primary path: the `X-Telegram-Init-Data` header carries Telegram's signed
 * initData, which we verify against the bot token. This is what binds every
 * request to a real Telegram account.
 *
 * Dev path (ALLOW_DEV_AUTH=true only): an `X-Dev-User` header lets you test
 * from a normal browser. This is force-disabled in production.
 */
export function authenticate(req: FastifyRequest, config: Config): AuthResult {
  const initData = req.headers['x-telegram-init-data'];
  if (typeof initData === 'string' && initData.length > 0) {
    const result = validateInitData(initData, config.botToken);
    if (!result.ok) return { ok: false, status: 401, error: `auth_failed:${result.error}` };
    return { ok: true, user: result.user };
  }

  if (config.allowDevAuth) {
    const devUser = req.headers['x-dev-user'];
    if (typeof devUser === 'string' && devUser.length > 0) {
      const id = Number(devUser);
      if (Number.isFinite(id)) {
        return { ok: true, user: { id, first_name: 'Dev' } };
      }
    }
  }

  return { ok: false, status: 401, error: 'missing_init_data' };
}
