import type { FastifyInstance } from 'fastify';
import type { Config } from '../config';
import { logger } from '../lib/logger';
import { rateLimit } from '../lib/rateLimit';
import { normalizeTarget, parseChannel } from '../lib/validate';
import { authenticate } from '../telegram/auth';
import { generateCode, hashCode } from '../verification/codes';
import type { Delivery } from '../verification/delivery';
import { putPendingCode, verifyCode } from '../verification/store';

interface RequestBody {
  channel?: string;
  target?: string;
}

interface ConfirmBody {
  channel?: string;
  target?: string;
  code?: string;
}

export function registerAuthRoutes(
  app: FastifyInstance,
  config: Config,
  delivery: Delivery,
): void {
  // Step 1: request an ownership-verification code for an email/phone.
  app.post<{ Body: RequestBody }>('/api/verify/request', async (req, reply) => {
    const auth = authenticate(req, config);
    if (!auth.ok) return reply.code(auth.status).send({ ok: false, error: auth.error });

    const channel = parseChannel(req.body?.channel);
    if (!channel) return reply.code(400).send({ ok: false, error: 'bad_channel' });

    const target = normalizeTarget(channel, String(req.body?.target ?? ''));
    if (!target) return reply.code(400).send({ ok: false, error: 'bad_target' });

    // Two rate limits: protect the user, and protect arbitrary targets from
    // being spammed with codes via our service.
    const perUser = rateLimit(`req:user:${auth.user.id}`, 5, 60_000);
    if (!perUser.ok) {
      return reply.code(429).send({ ok: false, error: 'rate_limited', retryAfterMs: perUser.retryAfterMs });
    }
    const perTarget = rateLimit(`req:target:${channel}:${target}`, 3, 10 * 60_000);
    if (!perTarget.ok) {
      return reply.code(429).send({ ok: false, error: 'rate_limited', retryAfterMs: perTarget.retryAfterMs });
    }

    const code = generateCode();
    putPendingCode(auth.user.id, channel, target, hashCode(code, config.codeSalt), config.codeTtlSeconds);

    try {
      if (channel === 'email') await delivery.sendEmailCode(target, code);
      else await delivery.sendSmsCode(target, code);
    } catch (err) {
      logger.error('delivery_failed', err);
      return reply.code(502).send({ ok: false, error: 'delivery_failed' });
    }

    const body: Record<string, unknown> = { ok: true, expiresInSeconds: config.codeTtlSeconds };
    if (config.exposeDevCode) body.devCode = code; // dev-only convenience
    return reply.send(body);
  });

  // Step 2: confirm the code → marks (user, channel, target) as verified.
  app.post<{ Body: ConfirmBody }>('/api/verify/confirm', async (req, reply) => {
    const auth = authenticate(req, config);
    if (!auth.ok) return reply.code(auth.status).send({ ok: false, error: auth.error });

    const channel = parseChannel(req.body?.channel);
    if (!channel) return reply.code(400).send({ ok: false, error: 'bad_channel' });

    const target = normalizeTarget(channel, String(req.body?.target ?? ''));
    if (!target) return reply.code(400).send({ ok: false, error: 'bad_target' });

    const code = String(req.body?.code ?? '').trim();
    if (!/^\d{6}$/.test(code)) return reply.code(400).send({ ok: false, error: 'bad_code_format' });

    const rl = rateLimit(`confirm:user:${auth.user.id}`, 10, 60_000);
    if (!rl.ok) {
      return reply.code(429).send({ ok: false, error: 'rate_limited', retryAfterMs: rl.retryAfterMs });
    }

    const outcome = verifyCode({
      tgUserId: auth.user.id,
      channel,
      target,
      code,
      salt: config.codeSalt,
      maxAttempts: config.maxVerifyAttempts,
      verifiedTtlSeconds: config.verifiedTtlSeconds,
    });

    if (outcome === 'ok') return reply.send({ ok: true, verified: true });
    return reply.code(400).send({ ok: false, verified: false, error: outcome });
  });
}
