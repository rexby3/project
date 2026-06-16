// Tiny in-memory sliding-window rate limiter.
// For production behind multiple instances, swap this for Redis.

const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
  remaining: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterMs = windowMs - (now - hits[0]);
    return { ok: false, retryAfterMs, remaining: 0 };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfterMs: 0, remaining: limit - hits.length };
}

// Exposed for tests.
export function _resetRateLimits(): void {
  buckets.clear();
}
