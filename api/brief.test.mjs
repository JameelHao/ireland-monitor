import { strict as assert } from 'node:assert';
import test from 'node:test';
import { createBriefResponse } from './brief.js';
import { clearBriefCacheForTest } from './_brief-cache.js';

function makeRequest(query = '') {
  return new Request(`https://ireland-monitor.vercel.app/api/brief${query ? `?${query}` : ''}`);
}

test('returns 400 for invalid date', async () => {
  clearBriefCacheForTest();
  const res = await createBriefResponse(makeRequest('date=2026-13-01'));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'INVALID_DATE');
});

test('returns cached payload on second call', async () => {
  clearBriefCacheForTest();
  const deps = {
    fetch: async () => new Response('<rss><channel></channel></rss>', { status: 200, headers: { 'content-type': 'application/xml' } }),
  };

  // No news -> fallback path; still cached
  const first = await createBriefResponse(makeRequest('date=2026-03-20&limit=5'), deps);
  assert.equal(first.status, 200);
  const firstBody = await first.json();
  assert.equal(firstBody.cached, false);

  const second = await createBriefResponse(makeRequest('date=2026-03-20&limit=5'), deps);
  assert.equal(second.status, 200);
  const secondBody = await second.json();
  assert.equal(secondBody.cached, true);
});

test('degrades when AI provider is unavailable', async () => {
  clearBriefCacheForTest();
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>Dublin startup raises funding</title><link>https://example.com/a</link><pubDate>Thu, 20 Mar 2026 08:00:00 GMT</pubDate><description>Series A round</description></item>
  </channel></rss>`;

  const res = await createBriefResponse(makeRequest('date=2026-03-20'), {
    fetch: async () => new Response(xml, { status: 200, headers: { 'content-type': 'application/xml' } }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.degraded, true);
  assert.match(body.summary, /^-/);
  assert.equal(body.sourceCount >= 1, true);
});
