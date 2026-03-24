/**
 * PWA Tests
 *
 * Tests for PWA types, manifest validation, and utilities.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  PushSubscriptionData,
  StoredPushSubscription,
  PushNotificationPayload,
} from '../src/types/push.js';
import { PUSH_LIMITS, VAPID_CONFIG } from '../src/types/push.js';

describe('Push Types', () => {
  it('PushSubscriptionData should have required fields', () => {
    const subscription: PushSubscriptionData = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
    };

    assert.equal(subscription.endpoint.startsWith('https://'), true);
    assert.equal(typeof subscription.keys.p256dh, 'string');
    assert.equal(typeof subscription.keys.auth, 'string');
  });

  it('StoredPushSubscription should have all fields', () => {
    const stored: StoredPushSubscription = {
      id: 'push_123',
      endpoint: 'https://example.com/push/123',
      keys: { p256dh: 'key1', auth: 'key2' },
      subscribedAt: '2026-03-24T00:00:00Z',
      isActive: true,
    };

    assert.equal(stored.id, 'push_123');
    assert.equal(stored.isActive, true);
    assert.equal(stored.userId, undefined);
  });

  it('PushNotificationPayload should support optional fields', () => {
    const payload: PushNotificationPayload = {
      title: 'Test Notification',
      body: 'This is a test',
    };

    assert.equal(payload.title, 'Test Notification');
    assert.equal(payload.url, undefined);
    assert.equal(payload.tag, undefined);
  });
});

describe('Push Constants', () => {
  it('PUSH_LIMITS should have correct values', () => {
    assert.equal(PUSH_LIMITS.MAX_SUBSCRIPTIONS_PER_USER, 5);
    assert.equal(PUSH_LIMITS.MAX_NOTIFICATIONS_PER_HOUR, 10);
    assert.equal(PUSH_LIMITS.SUBSCRIPTION_TTL_DAYS, 30);
  });

  it('VAPID_CONFIG should have valid public key', () => {
    assert.equal(typeof VAPID_CONFIG.publicKey, 'string');
    assert.ok(VAPID_CONFIG.publicKey.length > 50);
    assert.ok(VAPID_CONFIG.subject.startsWith('mailto:'));
  });
});

describe('Manifest Validation', () => {
  const manifestPath = join(process.cwd(), 'public', 'manifest.json');

  it('manifest.json should exist', () => {
    assert.ok(existsSync(manifestPath), 'manifest.json should exist in public/');
  });

  it('manifest.json should be valid JSON', () => {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    assert.ok(manifest, 'manifest.json should parse as valid JSON');
  });

  it('manifest should have required fields', () => {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    assert.equal(typeof manifest.name, 'string');
    assert.equal(typeof manifest.short_name, 'string');
    assert.equal(typeof manifest.start_url, 'string');
    assert.equal(typeof manifest.display, 'string');
    assert.equal(typeof manifest.background_color, 'string');
    assert.equal(typeof manifest.theme_color, 'string');
  });

  it('manifest should have icons array', () => {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    assert.ok(Array.isArray(manifest.icons));
    assert.ok(manifest.icons.length > 0);
  });

  it('manifest icons should have required sizes', () => {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);

    // PWA requires at least 192x192 and 512x512
    assert.ok(sizes.includes('192x192'), 'Should have 192x192 icon');
    assert.ok(sizes.includes('512x512'), 'Should have 512x512 icon');
  });

  it('manifest display should be standalone', () => {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    assert.equal(manifest.display, 'standalone');
  });
});

describe('Service Worker Validation', () => {
  const swPath = join(process.cwd(), 'public', 'sw.js');

  it('sw.js should exist', () => {
    assert.ok(existsSync(swPath), 'sw.js should exist in public/');
  });

  it('sw.js should have install event handler', () => {
    const content = readFileSync(swPath, 'utf-8');
    assert.ok(content.includes("addEventListener('install'"));
  });

  it('sw.js should have activate event handler', () => {
    const content = readFileSync(swPath, 'utf-8');
    assert.ok(content.includes("addEventListener('activate'"));
  });

  it('sw.js should have fetch event handler', () => {
    const content = readFileSync(swPath, 'utf-8');
    assert.ok(content.includes("addEventListener('fetch'"));
  });

  it('sw.js should have push event handler', () => {
    const content = readFileSync(swPath, 'utf-8');
    assert.ok(content.includes("addEventListener('push'"));
  });

  it('sw.js should define cache name', () => {
    const content = readFileSync(swPath, 'utf-8');
    assert.ok(content.includes('CACHE_NAME'));
  });
});

describe('Endpoint Hash Function', () => {
  // Replicate hash function for testing
  function hashEndpoint(endpoint: string): string {
    let hash = 0;
    for (let i = 0; i < endpoint.length; i++) {
      const char = endpoint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  it('should produce consistent hashes', () => {
    const endpoint = 'https://fcm.googleapis.com/fcm/send/abc123';
    const hash1 = hashEndpoint(endpoint);
    const hash2 = hashEndpoint(endpoint);
    assert.equal(hash1, hash2);
  });

  it('should produce different hashes for different endpoints', () => {
    const hash1 = hashEndpoint('https://example.com/1');
    const hash2 = hashEndpoint('https://example.com/2');
    assert.notEqual(hash1, hash2);
  });

  it('should produce alphanumeric hashes', () => {
    const hash = hashEndpoint('https://test.com/push');
    assert.match(hash, /^[a-z0-9]+$/);
  });
});

describe('Subscription Validation', () => {
  function isValidSubscription(sub: unknown): boolean {
    if (!sub || typeof sub !== 'object') return false;
    const s = sub as Record<string, unknown>;
    return (
      typeof s.endpoint === 'string' &&
      (s.endpoint as string).startsWith('https://') &&
      s.keys !== null &&
      typeof s.keys === 'object' &&
      typeof (s.keys as Record<string, unknown>).p256dh === 'string' &&
      typeof (s.keys as Record<string, unknown>).auth === 'string'
    );
  }

  it('should accept valid subscription', () => {
    const sub = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      keys: { p256dh: 'key1', auth: 'key2' },
    };
    assert.ok(isValidSubscription(sub));
  });

  it('should reject subscription without endpoint', () => {
    const sub = {
      keys: { p256dh: 'key1', auth: 'key2' },
    };
    assert.ok(!isValidSubscription(sub));
  });

  it('should reject subscription with http endpoint', () => {
    const sub = {
      endpoint: 'http://insecure.com/push',
      keys: { p256dh: 'key1', auth: 'key2' },
    };
    assert.ok(!isValidSubscription(sub));
  });

  it('should reject subscription without keys', () => {
    const sub = {
      endpoint: 'https://example.com/push',
    };
    assert.ok(!isValidSubscription(sub));
  });

  it('should reject subscription with incomplete keys', () => {
    const sub = {
      endpoint: 'https://example.com/push',
      keys: { p256dh: 'key1' },
    };
    assert.ok(!isValidSubscription(sub));
  });
});

describe('VAPID Key Format', () => {
  it('VAPID public key should be base64url encoded', () => {
    const key = VAPID_CONFIG.publicKey;
    // Base64url uses only these characters
    assert.match(key, /^[A-Za-z0-9_-]+$/);
  });

  it('VAPID public key should be correct length', () => {
    const key = VAPID_CONFIG.publicKey;
    // VAPID keys are typically 65 bytes = ~87 chars in base64
    assert.ok(key.length >= 80 && key.length <= 90);
  });
});

describe('Notification Payload Validation', () => {
  function isValidPayload(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
      typeof p.title === 'string' &&
      p.title.length > 0 &&
      typeof p.body === 'string'
    );
  }

  it('should accept valid payload', () => {
    const payload = { title: 'Hello', body: 'World' };
    assert.ok(isValidPayload(payload));
  });

  it('should reject payload without title', () => {
    const payload = { body: 'World' };
    assert.ok(!isValidPayload(payload));
  });

  it('should reject payload with empty title', () => {
    const payload = { title: '', body: 'World' };
    assert.ok(!isValidPayload(payload));
  });

  it('should accept payload with optional fields', () => {
    const payload = {
      title: 'News',
      body: 'Breaking news!',
      url: '/news/123',
      tag: 'news',
    };
    assert.ok(isValidPayload(payload));
  });
});
