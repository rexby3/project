import type { FastifyInstance } from 'fastify';
import type { Config } from '../config';
import type { Providers } from '../providers';

export function registerHealthRoutes(
  app: FastifyInstance,
  config: Config,
  providers: Providers,
): void {
  app.get('/api/health', async () => ({
    ok: true,
    mode: config.mockBreaches ? 'demo' : 'live',
    providers: {
      email: { name: providers.email.name, available: providers.email.available },
      phone: { name: providers.phone.name, available: providers.phone.available },
    },
    delivery: { email: config.emailDelivery, sms: config.smsDelivery },
  }));
}
