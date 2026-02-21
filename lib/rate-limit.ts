interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitRecord>>();

function getStore(namespace: string): Map<string, RateLimitRecord> {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  return stores.get(namespace)!;
}

export function isRateLimited(
  key: string,
  namespace: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const store = getStore(namespace);
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count++;
  return record.count > maxAttempts;
}
