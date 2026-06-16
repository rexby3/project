type Level = 'debug' | 'info' | 'warn' | 'error';

const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel = order[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? order.info;

function emit(level: Level, msg: string, extra?: unknown): void {
  if (order[level] < minLevel) return;
  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${msg}`;
  const fn = console[level] ?? console.log;
  if (extra !== undefined) fn(line, extra);
  else fn(line);
}

export const logger = {
  debug: (msg: string, extra?: unknown) => emit('debug', msg, extra),
  info: (msg: string, extra?: unknown) => emit('info', msg, extra),
  warn: (msg: string, extra?: unknown) => emit('warn', msg, extra),
  error: (msg: string, extra?: unknown) => emit('error', msg, extra),
};
