import type { Config } from '../config';
import { logger } from '../lib/logger';

export interface Delivery {
  sendEmailCode(to: string, code: string): Promise<void>;
  sendSmsCode(to: string, code: string): Promise<void>;
}

async function sendTwilio(config: Config, to: string, code: string): Promise<void> {
  const { sid, token, from } = config.twilio;
  if (!sid || !token || !from) throw new Error('twilio_not_configured');

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: `Код подтверждения SelfCheck: ${code}. Никому его не сообщайте.`,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`twilio_send_failed_${res.status}: ${text}`);
  }
}

async function sendSmtp(config: Config, to: string, code: string): Promise<void> {
  const { host, port, user, pass, from } = config.smtp;
  if (!host || !from) throw new Error('smtp_not_configured');

  // nodemailer is an OPTIONAL dependency: loaded only if EMAIL_DELIVERY=smtp.
  // The dynamic specifier keeps it out of the build when unused.
  const moduleName = 'nodemailer';
  let nodemailer: { createTransport: (opts: unknown) => { sendMail: (m: unknown) => Promise<unknown> } };
  try {
    nodemailer = (await import(moduleName)) as typeof nodemailer;
  } catch {
    throw new Error('smtp_delivery_requires_nodemailer (run: npm i nodemailer -w server)');
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  await transport.sendMail({
    from,
    to,
    subject: 'Код подтверждения SelfCheck',
    text: `Ваш код подтверждения: ${code}\nОн действует ограниченное время. Никому его не сообщайте.`,
  });
}

export function createDelivery(config: Config): Delivery {
  return {
    async sendEmailCode(to, code) {
      if (config.emailDelivery === 'smtp') {
        await sendSmtp(config, to, code);
        return;
      }
      logger.info(`[MOCK email] verification code for ${to}: ${code}`);
    },
    async sendSmsCode(to, code) {
      if (config.smsDelivery === 'twilio') {
        await sendTwilio(config, to, code);
        return;
      }
      logger.info(`[MOCK sms] verification code for ${to}: ${code}`);
    },
  };
}
