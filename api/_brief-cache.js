const store = new Map();

function nowMs() {
  return Date.now();
}

function getTtlMs() {
  const raw = Number(process.env.BRIEF_CACHE_TTL_HOURS || '24');
  const hours = Number.isFinite(raw) && raw > 0 ? raw : 24;
  return hours * 60 * 60 * 1000;
}

export function getBriefCache(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= nowMs()) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function setBriefCache(key, value) {
  store.set(key, {
    value,
    expiresAt: nowMs() + getTtlMs(),
  });
}

export function clearBriefCacheForTest() {
  store.clear();
}
