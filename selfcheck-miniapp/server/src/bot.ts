import { Bot, InlineKeyboard } from 'grammy';
import type { Config } from './config';
import { logger } from './lib/logger';

export function createBot(config: Config): Bot | null {
  if (!config.botToken) {
    logger.warn('BOT_TOKEN is not set — Telegram bot disabled (HTTP API still runs).');
    return null;
  }

  const bot = new Bot(config.botToken);

  bot.command('start', async (ctx) => {
    const text = [
      '👋 *SelfCheck* — проверка утечек *твоих собственных* данных.',
      '',
      'Открой мини-приложение, введи свой email или номер телефона, подтверди владение кодом — и получишь отчёт: где данные могли утечь и что с этим делать.',
      '',
      '⚠️ Проверять можно только свои данные: отчёт открывается лишь после подтверждения кодом.',
    ].join('\n');

    const keyboard = config.webappUrl
      ? new InlineKeyboard().webApp('🔎 Открыть SelfCheck', config.webappUrl)
      : undefined;

    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: keyboard });
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      'Открой мини-приложение кнопкой ниже или через меню, введи свои email/телефон и подтверди код. Мы показываем утечки только по подтверждённым тобой данным.',
      config.webappUrl
        ? { reply_markup: new InlineKeyboard().webApp('🔎 Открыть SelfCheck', config.webappUrl) }
        : undefined,
    );
  });

  bot.catch((err) => logger.error('bot_error', err.error));

  return bot;
}
