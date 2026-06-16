import crypto from 'node:crypto';
import { logger } from './lib/logger';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface TwilioConfig {
  sid: string;
  token: string;
  from: string;
}

export interface Config {
  port: number;
  host: string;
  botToken: string;
  webappUrl: string;
  codeSalt: string;
  hibpApiKey: string | null;
  phoneProvider: string;
  phoneProviderApiKey: string | null;
  emailDelivery: 'mock' | 'smtp';
  smsDelivery: 'mock' | 'twilio';
  smtp: SmtpConfig;
  twilio: TwilioConfig;
  mockBreaches: boolean;
  allowDevAuth: boolean;
  exposeDevCode: boolean;
  codeTtlSeconds: number;
  maxVerifyAttempts: number;
  verifiedTtlSeconds: number;
  isProd: boolean;
}

function bool(value: string | undefined, def = false): boolean {
  if (value === undefined) return def;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function str(value: string | undefined, def = ''): string {
  const v = (value ?? '').trim();
  return v.length > 0 ? v : def;
}

function num(value: string | undefined, def: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : def;
}

let cached: Config | null = null;

export function loadConfig(): Config {
  if (cached) return cached;

  // Node >=20.12 / 22 can load .env natively; ignore if the file is absent.
  const loadEnvFile = (process as unknown as { loadEnvFile?: (p?: string) => void }).loadEnvFile;
  // Try the package dir first, then the project root: npm workspace scripts run
  // with cwd set to the workspace (server/), but the .env usually lives at the
  // root. In Docker, env vars are injected directly, so neither file is needed.
  for (const envPath of ['.env', '../.env']) {
    try {
      loadEnvFile?.(envPath);
      break;
    } catch {
      /* not present at this path — try the next */
    }
  }

  const isProd = str(process.env.NODE_ENV) === 'production';

  let mockBreaches = bool(process.env.MOCK_BREACHES);
  let allowDevAuth = bool(process.env.ALLOW_DEV_AUTH);
  let exposeDevCode = bool(process.env.EXPOSE_DEV_CODE);
  if (isProd && (mockBreaches || allowDevAuth || exposeDevCode)) {
    logger.warn(
      'Dev switches (MOCK_BREACHES / ALLOW_DEV_AUTH / EXPOSE_DEV_CODE) are forced OFF because NODE_ENV=production',
    );
    mockBreaches = false;
    allowDevAuth = false;
    exposeDevCode = false;
  }

  let codeSalt = str(process.env.CODE_SALT);
  if (!codeSalt) {
    codeSalt = crypto.randomBytes(32).toString('hex');
    logger.warn(
      'CODE_SALT is not set — using a random per-process salt. Pending verification codes will not survive a restart.',
    );
  }

  cached = {
    port: num(process.env.PORT, 8080),
    host: str(process.env.HOST, '0.0.0.0'),
    botToken: str(process.env.BOT_TOKEN),
    webappUrl: str(process.env.WEBAPP_URL),
    codeSalt,
    hibpApiKey: str(process.env.HIBP_API_KEY) || null,
    phoneProvider: str(process.env.PHONE_PROVIDER, 'stub'),
    phoneProviderApiKey: str(process.env.PHONE_PROVIDER_API_KEY) || null,
    emailDelivery: str(process.env.EMAIL_DELIVERY, 'mock') === 'smtp' ? 'smtp' : 'mock',
    smsDelivery: str(process.env.SMS_DELIVERY, 'mock') === 'twilio' ? 'twilio' : 'mock',
    smtp: {
      host: str(process.env.SMTP_HOST),
      port: num(process.env.SMTP_PORT, 587),
      user: str(process.env.SMTP_USER),
      pass: str(process.env.SMTP_PASS),
      from: str(process.env.SMTP_FROM),
    },
    twilio: {
      sid: str(process.env.TWILIO_ACCOUNT_SID),
      token: str(process.env.TWILIO_AUTH_TOKEN),
      from: str(process.env.TWILIO_FROM),
    },
    mockBreaches,
    allowDevAuth,
    exposeDevCode,
    codeTtlSeconds: num(process.env.CODE_TTL_SECONDS, 600),
    maxVerifyAttempts: num(process.env.MAX_VERIFY_ATTEMPTS, 5),
    verifiedTtlSeconds: num(process.env.VERIFIED_TTL_SECONDS, 1800),
    isProd,
  };

  return cached;
}

// For tests.
export function _resetConfig(): void {
  cached = null;
}
