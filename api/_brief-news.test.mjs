import { strict as assert } from 'node:assert';
import test from 'node:test';
import { getNewsByRegion } from './_brief-news.js';

const xml = `<?xml version="1.0"?>
<rss><channel>
  <item><title>A</title><link>https://x.test/1</link><pubDate>Thu, 20 Mar 2026 10:00:00 GMT</pubDate><description>one</description></item>
  <item><title>B</title><link>https://x.test/2</link><pubDate>Thu, 19 Mar 2026 10:00:00 GMT</pubDate><description>two</description></item>
  <item><title>A duplicate</title><link>https://x.test/1</link><pubDate>Thu, 20 Mar 2026 09:00:00 GMT</pubDate><description>dup</description></item>
</channel></rss>`;

test('filters by date and deduplicates by link', async () => {
  const items = await getNewsByRegion({
    date: '2026-03-20',
    limit: 20,
    category: ['ieTech'],
  }, {
    fetch: async () => new Response(xml, { status: 200, headers: { 'content-type': 'application/xml' } }),
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'A');
  assert.equal(items[0].link, 'https://x.test/1');
});
