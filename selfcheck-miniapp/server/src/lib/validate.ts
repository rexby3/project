export type Channel = 'email' | 'phone';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize and validate an email. Returns null if it is not a plausible address. */
export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

/** Normalize a phone number to a `+<digits>` form. Returns null if implausible. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

export function normalizeTarget(channel: Channel, input: string): string | null {
  return channel === 'email' ? normalizeEmail(input) : normalizePhone(input);
}

export function parseChannel(value: unknown): Channel | null {
  return value === 'email' || value === 'phone' ? value : null;
}

/** a***@example.com */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.slice(0, 1);
  return `${head}${'*'.repeat(Math.max(1, local.length - 1))}@${domain}`;
}

/** +1········6789 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  const last4 = digits.slice(-4);
  const headLen = Math.min(2, digits.length - 4);
  const head = digits.slice(0, headLen);
  return `+${head}${'·'.repeat(Math.max(2, digits.length - headLen - 4))}${last4}`;
}

export function maskTarget(channel: Channel, target: string): string {
  return channel === 'email' ? maskEmail(target) : maskPhone(target);
}
