import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeTime, highlightKeywords } from '@/components/AlertPanel';

describe('alert-panel helpers', () => {
  it('highlights matching keywords safely', () => {
    const html = highlightKeywords('TCD secures funding', ['funding']);
    assert.match(html, /<mark>funding<\/mark>/i);
  });

  it('escapes html before highlighting', () => {
    const html = highlightKeywords('<script>alert(1)</script> funding', ['funding']);
    assert.ok(!html.includes('<script>'));
    assert.match(html, /&lt;script&gt;/);
  });

  it('formats relative time', () => {
    const now = Date.now();
    assert.equal(formatRelativeTime(now), 'Just now');
    assert.equal(formatRelativeTime(now - 5 * 60_000), '5m ago');
  });
});
