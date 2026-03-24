/**
 * Push Notification API
 *
 * Manages push notification subscriptions for PWA.
 * Uses Upstash REST API for Edge Function compatibility.
 *
 * Routes:
 * - POST /api/push/subscribe - Subscribe to push notifications
 * - POST /api/push/unsubscribe - Unsubscribe from push notifications
 * - GET /api/push/vapid - Get VAPID public key
 */

import { jsonResponse } from './_json-response.js';
import { withCors } from './_cors.js';

// VAPID public key (safe to expose)
const VAPID_PUBLIC_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// Redis key helpers
const keys = {
  subscriptions: () => 'push:subscriptions',
  endpoint: (hash) => `push:endpoint:${hash}`,
  userSubscriptions: (userId) => `push:user:${userId}`,
};

// Simple hash function for endpoints
function hashEndpoint(endpoint) {
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    const char = endpoint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Generate subscription ID
function generateSubscriptionId() {
  return `push_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Upstash REST API helpers
async function redisCmd(cmd, ...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cmdUrl = `${url}/${[cmd, ...args.map(encodeURIComponent)].join('/')}`;
  const resp = await fetch(cmdUrl, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!resp.ok) return null;

  const data = await resp.json();
  return data.result;
}

async function redisGet(key) {
  const result = await redisCmd('get', key);
  if (!result) return null;
  try {
    return JSON.parse(result);
  } catch {
    return null;
  }
}

async function redisSet(key, value, exSeconds) {
  if (exSeconds) {
    return redisCmd('setex', key, String(exSeconds), JSON.stringify(value));
  }
  return redisCmd('set', key, JSON.stringify(value));
}

async function redisDel(key) {
  return redisCmd('del', key);
}

async function redisSadd(key, member) {
  return redisCmd('sadd', key, member);
}

async function redisSrem(key, member) {
  return redisCmd('srem', key, member);
}

async function redisScard(key) {
  const result = await redisCmd('scard', key);
  return parseInt(result, 10) || 0;
}

// Validate subscription data
function isValidSubscription(sub) {
  return (
    sub &&
    typeof sub.endpoint === 'string' &&
    sub.endpoint.startsWith('https://') &&
    sub.keys &&
    typeof sub.keys.p256dh === 'string' &&
    typeof sub.keys.auth === 'string'
  );
}

// Handler
async function handler(request) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return jsonResponse({ success: false, error: 'Storage not configured' }, { status: 503 });
  }

  const reqUrl = new URL(request.url);
  const method = request.method;
  const path = reqUrl.pathname;

  try {
    // GET /api/push/vapid - Return VAPID public key
    if (method === 'GET' && path.endsWith('/vapid')) {
      return jsonResponse({
        success: true,
        vapidPublicKey: VAPID_PUBLIC_KEY,
      });
    }

    // POST /api/push/subscribe
    if (method === 'POST' && path.endsWith('/subscribe')) {
      const body = await request.json();
      const { subscription, userId } = body;

      if (!isValidSubscription(subscription)) {
        return jsonResponse(
          { success: false, error: 'Invalid subscription data' },
          { status: 400 }
        );
      }

      const endpointHash = hashEndpoint(subscription.endpoint);

      // Check if already subscribed
      const existing = await redisGet(keys.endpoint(endpointHash));
      if (existing) {
        // Update existing
        existing.keys = subscription.keys;
        existing.isActive = true;
        if (userId) existing.userId = userId;

        await redisSet(keys.endpoint(endpointHash), existing, 30 * 24 * 3600);

        return jsonResponse({
          success: true,
          subscriptionId: existing.id,
          message: 'Subscription updated',
        });
      }

      // Check user limit
      if (userId) {
        const userSubCount = await redisScard(keys.userSubscriptions(userId));
        if (userSubCount >= 5) {
          return jsonResponse(
            { success: false, error: 'Maximum 5 subscriptions per user' },
            { status: 400 }
          );
        }
      }

      // Create new subscription
      const stored = {
        id: generateSubscriptionId(),
        userId: userId || null,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        subscribedAt: new Date().toISOString(),
        isActive: true,
        userAgent: request.headers.get('user-agent') || null,
      };

      // Save to Redis (30 day TTL)
      await redisSet(keys.endpoint(endpointHash), stored, 30 * 24 * 3600);
      await redisSadd(keys.subscriptions(), endpointHash);

      if (userId) {
        await redisSadd(keys.userSubscriptions(userId), stored.id);
      }

      return jsonResponse({
        success: true,
        subscriptionId: stored.id,
      });
    }

    // POST /api/push/unsubscribe
    if (method === 'POST' && path.endsWith('/unsubscribe')) {
      const body = await request.json();
      const { endpoint } = body;

      if (!endpoint) {
        return jsonResponse({ success: false, error: 'Endpoint required' }, { status: 400 });
      }

      const endpointHash = hashEndpoint(endpoint);

      // Get subscription first
      const existing = await redisGet(keys.endpoint(endpointHash));

      // Remove from Redis
      await redisDel(keys.endpoint(endpointHash));
      await redisSrem(keys.subscriptions(), endpointHash);

      if (existing && existing.userId) {
        await redisSrem(keys.userSubscriptions(existing.userId), existing.id);
      }

      return jsonResponse({ success: true, message: 'Unsubscribed' });
    }

    return jsonResponse({ success: false, error: 'Not found' }, { status: 404 });
  } catch (e) {
    console.error('[push API] Error:', e);
    return jsonResponse({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export default withCors(handler);

export const config = {
  runtime: 'edge',
};
