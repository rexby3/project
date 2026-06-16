import type { FastifyInstance } from 'fastify';
import type { Config } from '../config';
import { logger } from '../lib/logger';
import { rateLimit } from '../lib/rateLimit';
import { normalizeTarget, parseChannel } from '../lib/validate';
import type { Providers } from '../providers';
import type { BreachItem } from '../providers/types';
import { buildReport } from '../services/report';
import { authenticate } from '../telegram/auth';
import { isVerified } from '../verification/store';

interface CheckBody {
  channel?: string;
  target?: string;
}

export function registerCheckRoutes(
  app: FastifyInstance,
  config: Config,
  providers: Providers,
): void {
  app.post<{ Body: CheckBody }>('/api/check', async (req, reply) => {
    const auth = authenticate(req, config);
    if (!auth.ok) return reply.code(auth.status).send({ ok: false, error: auth.error });

    const channel = parseChannel(req.body?.channel);
    if (!channel) return reply.code(400).send({ ok: false, error: 'bad_channel' });

    const target = normalizeTarget(channel, String(req.body?.target ?? ''));
    if (!target) return reply.code(400).send({ ok: false, error: 'bad_target' });

    // The core safeguard: results are released ONLY for data the caller has
    // proven they own. No verification → no lookup. This is what keeps the
    // tool a self-check and not a people-search.
    if (!isVerified(auth.user.id, channel, target)) {
      return reply.code(403).send({ ok: false, error: 'ownership_not_verified' });
    }

    const rl = rateLimit(`check:user:${auth.user.id}`, 20, 60_000);
    if (!rl.ok) {
      return reply.code(429).send({ ok: false, error: 'rate_limited', retryAfterMs: rl.retryAfterMs });
    }

    const provider = channel === 'email' ? providers.email : providers.phone;
    let breaches: BreachItem[] = [];
    try {
      breaches = provider.available ? await provider.check(target) : [];
    } catch (err) {
      logger.error('provider_check_failed', err);
      return reply.code(502).send({ ok: false, error: 'provider_failed' });
    }

    const report = buildReport({
      channel,
      target,
      providerAvailable: provider.available,
      breaches,
    });
    return reply.send({ ok: true, report });
  });
}
