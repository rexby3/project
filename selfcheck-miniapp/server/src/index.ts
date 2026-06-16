import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { createBot } from './bot';
import { loadConfig } from './config';
import { logger } from './lib/logger';
import { createProviders } from './providers';
import { registerAuthRoutes } from './routes/auth';
import { registerCheckRoutes } from './routes/check';
import { registerHealthRoutes } from './routes/health';
import { createDelivery } from './verification/delivery';

function findWebDir(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.WEB_DIR,
    path.resolve(here, '../../web/dist'), // built: server/dist/index.js
    path.resolve(here, '../web/dist'), // dev (tsx): server/src/index.ts
    path.resolve(process.cwd(), 'web/dist'),
    path.resolve(process.cwd(), '../web/dist'),
  ].filter((p): p is string => Boolean(p));
  return candidates.find((p) => existsSync(p)) ?? null;
}

async function main(): Promise<void> {
  const config = loadConfig();
  const providers = createProviders(config);
  const delivery = createDelivery(config);

  const app = Fastify({ logger: false, bodyLimit: 64 * 1024 });
  await app.register(cors, { origin: true });

  registerHealthRoutes(app, config, providers);
  registerAuthRoutes(app, config, delivery);
  registerCheckRoutes(app, config, providers);

  const webDir = findWebDir();
  if (webDir) {
    await app.register(fastifyStatic, { root: webDir, index: ['index.html'] });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api')) {
        return reply.code(404).send({ ok: false, error: 'not_found' });
      }
      return reply.sendFile('index.html');
    });
    logger.info(`Serving web app from ${webDir}`);
  } else {
    logger.warn('Web build not found — run "npm run build -w web". HTTP API is still available.');
  }

  await app.listen({ port: config.port, host: config.host });
  logger.info(`HTTP server listening on http://${config.host}:${config.port}`);
  logger.info(`Mode: ${config.mockBreaches ? 'DEMO (sample data)' : 'live'} | email provider: ${providers.email.name} (available=${providers.email.available}) | phone provider: ${providers.phone.name} (available=${providers.phone.available})`);

  const bot = createBot(config);
  if (bot) {
    void bot.start({
      onStart: (info) => logger.info(`Telegram bot @${info.username} started (long polling)`),
    });
  }
}

main().catch((err) => {
  logger.error('fatal', err);
  process.exit(1);
});
