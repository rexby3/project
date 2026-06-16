import { getInitData } from './telegram';
import type { Channel, CheckResponse, ConfirmResponse, RequestCodeResponse } from './types';

// Optional dev fallback: set VITE_DEV_USER in web/.env.local to test in a
// normal browser (requires ALLOW_DEV_AUTH=true on the server).
const DEV_USER = import.meta.env.VITE_DEV_USER as string | undefined;

export class ApiError extends Error {
  readonly status: number;
  constructor(code: string, status: number) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const initData = getInitData();
  if (initData) headers['X-Telegram-Init-Data'] = initData;
  else if (DEV_USER) headers['X-Dev-User'] = DEV_USER;

  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty/non-JSON body */
  }

  if (!res.ok) {
    const code =
      (data as { error?: string } | null)?.error ?? `http_${res.status}`;
    throw new ApiError(code, res.status);
  }
  return data as T;
}

export const api = {
  requestCode: (channel: Channel, target: string) =>
    post<RequestCodeResponse>('/api/verify/request', { channel, target }),
  confirmCode: (channel: Channel, target: string, code: string) =>
    post<ConfirmResponse>('/api/verify/confirm', { channel, target, code }),
  check: (channel: Channel, target: string) =>
    post<CheckResponse>('/api/check', { channel, target }),
};
