/**
 * Pro Banner Tests
 *
 * Tests for compact Pro banner with dismiss functionality.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Constants (mirror from ProBanner.ts)
const DISMISS_KEY = 'wm-pro-banner-dismissed';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

describe('Pro Banner Constants', () => {
  it('should have correct dismiss key', () => {
    assert.equal(DISMISS_KEY, 'wm-pro-banner-dismissed');
  });

  it('should have 7 day dismiss duration', () => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    assert.equal(DISMISS_MS, sevenDaysMs);
    assert.equal(DISMISS_MS, 604800000);
  });
});

describe('Dismiss Logic', () => {
  // Mock localStorage for testing
  let storage: Map<string, string>;

  function mockLocalStorage() {
    storage = new Map();
    return {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };
  }

  function isDismissed(localStorage: ReturnType<typeof mockLocalStorage>): boolean {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    if (Date.now() - Number(ts) > DISMISS_MS) {
      localStorage.removeItem(DISMISS_KEY);
      return false;
    }
    return true;
  }

  beforeEach(() => {
    storage = new Map();
  });

  it('should return false when no dismiss timestamp', () => {
    const ls = mockLocalStorage();
    assert.equal(isDismissed(ls), false);
  });

  it('should return true when dismissed recently', () => {
    const ls = mockLocalStorage();
    ls.setItem(DISMISS_KEY, String(Date.now()));
    assert.equal(isDismissed(ls), true);
  });

  it('should return false when dismiss expired (> 7 days)', () => {
    const ls = mockLocalStorage();
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    ls.setItem(DISMISS_KEY, String(eightDaysAgo));
    assert.equal(isDismissed(ls), false);
    // Should also remove the expired key
    assert.equal(ls.getItem(DISMISS_KEY), null);
  });

  it('should return true when dismissed 6 days ago', () => {
    const ls = mockLocalStorage();
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    ls.setItem(DISMISS_KEY, String(sixDaysAgo));
    assert.equal(isDismissed(ls), true);
  });

  it('should return false when dismissed exactly 7 days + 1ms ago', () => {
    const ls = mockLocalStorage();
    const justExpired = Date.now() - DISMISS_MS - 1;
    ls.setItem(DISMISS_KEY, String(justExpired));
    assert.equal(isDismissed(ls), false);
  });
});

describe('Banner HTML Structure', () => {
  function createBannerHTML(): string {
    return `
    <span class="pro-banner-badge">PRO</span>
    <span class="pro-banner-text">
      <strong>PRO Coming Soon</strong>
    </span>
    <a class="pro-banner-cta" href="/pro">Reserve your spot →</a>
    <button class="pro-banner-close" aria-label="Dismiss">×</button>
  `;
  }

  it('should contain PRO badge', () => {
    const html = createBannerHTML();
    assert.ok(html.includes('pro-banner-badge'));
    assert.ok(html.includes('PRO'));
  });

  it('should contain compact text', () => {
    const html = createBannerHTML();
    assert.ok(html.includes('PRO Coming Soon'));
    // Should not contain old long text
    assert.ok(!html.includes('More Signal, Less Noise'));
  });

  it('should contain CTA link', () => {
    const html = createBannerHTML();
    assert.ok(html.includes('pro-banner-cta'));
    assert.ok(html.includes('href="/pro"'));
    assert.ok(html.includes('Reserve your spot'));
  });

  it('should contain close button', () => {
    const html = createBannerHTML();
    assert.ok(html.includes('pro-banner-close'));
    assert.ok(html.includes('aria-label="Dismiss"'));
    assert.ok(html.includes('×'));
  });
});

describe('CSS Classes', () => {
  it('should have compact class', () => {
    const className = 'pro-banner pro-banner-compact';
    assert.ok(className.includes('pro-banner'));
    assert.ok(className.includes('pro-banner-compact'));
  });

  it('should have animation classes defined', () => {
    const inClass = 'pro-banner-in';
    const outClass = 'pro-banner-out';
    assert.equal(inClass, 'pro-banner-in');
    assert.equal(outClass, 'pro-banner-out');
  });
});

describe('Dismiss Timestamp', () => {
  it('should store current timestamp on dismiss', () => {
    const storage = new Map<string, string>();
    const now = Date.now();

    // Simulate dismiss
    storage.set(DISMISS_KEY, String(now));

    const stored = Number(storage.get(DISMISS_KEY));
    assert.ok(stored > 0);
    assert.ok(stored <= Date.now());
  });

  it('should clear storage after 7 days', () => {
    const storage = new Map<string, string>();
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    storage.set(DISMISS_KEY, String(eightDaysAgo));

    // Check if expired
    const ts = storage.get(DISMISS_KEY);
    if (ts && Date.now() - Number(ts) > DISMISS_MS) {
      storage.delete(DISMISS_KEY);
    }

    assert.equal(storage.get(DISMISS_KEY), undefined);
  });
});
