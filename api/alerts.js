/**
 * Smart Alert API
 *
 * CRUD operations for user alerts.
 *
 * Routes:
 * - GET /api/alerts?userId=xxx - List alerts for user
 * - POST /api/alerts - Create new alert
 * - PATCH /api/alerts?id=xxx&userId=xxx - Update alert
 * - DELETE /api/alerts?id=xxx&userId=xxx - Delete alert
 */

import { Redis } from '@upstash/redis';
import { jsonResponse } from './_json-response.js';
import { withCors } from './_cors.js';

// Redis key helpers
const keys = {
  alertList: (userId) => `alerts:${userId}:list`,
  alert: (userId, alertId) => `alerts:${userId}:${alertId}`,
  userProfile: (userId) => `alerts:users:${userId}`,
};

// Generate unique IDs
function generateAlertId() {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Initialize Redis client
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Validate alert request
function validateCreateRequest(body) {
  if (!body.keyword || typeof body.keyword !== 'string') {
    return 'keyword is required';
  }
  const keyword = body.keyword.trim();
  if (keyword.length < 2) {
    return 'keyword must be at least 2 characters';
  }
  if (keyword.length > 100) {
    return 'keyword must be at most 100 characters';
  }
  return null;
}

// Handler
async function handler(request) {
  const redis = getRedis();
  if (!redis) {
    return jsonResponse({ success: false, error: 'Storage not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const method = request.method;

  try {
    // GET - List alerts
    if (method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return jsonResponse({ success: false, error: 'userId required' }, { status: 400 });
      }

      const alertIds = await redis.smembers(keys.alertList(userId));
      const alerts = [];

      for (const alertId of alertIds) {
        const data = await redis.get(keys.alert(userId, alertId));
        if (data) {
          try {
            alerts.push(typeof data === 'string' ? JSON.parse(data) : data);
          } catch (e) {
            // Skip invalid entries
          }
        }
      }

      // Sort by createdAt descending
      alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return jsonResponse({ success: true, alerts });
    }

    // POST - Create alert
    if (method === 'POST') {
      const body = await request.json();
      const error = validateCreateRequest(body);
      if (error) {
        return jsonResponse({ success: false, error }, { status: 400 });
      }

      // Generate or use provided userId
      const userId = body.userId || generateUserId();
      const keyword = body.keyword.trim();

      // Check alert limit
      const count = await redis.scard(keys.alertList(userId));
      if (count >= 20) {
        return jsonResponse({ success: false, error: 'Maximum 20 alerts per user' }, { status: 400 });
      }

      // Check for duplicate
      const existingIds = await redis.smembers(keys.alertList(userId));
      for (const id of existingIds) {
        const data = await redis.get(keys.alert(userId, id));
        if (data) {
          const existing = typeof data === 'string' ? JSON.parse(data) : data;
          if (existing.keyword.toLowerCase() === keyword.toLowerCase()) {
            return jsonResponse({ success: false, error: 'Alert with this keyword already exists' }, { status: 400 });
          }
        }
      }

      const alertId = generateAlertId();
      const now = new Date().toISOString();

      const alert = {
        id: alertId,
        userId,
        keyword,
        priorityFilter: body.priorityFilter || ['CRITICAL', 'HIGH', 'NORMAL'],
        channels: body.channels || ['email'],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await redis.set(keys.alert(userId, alertId), JSON.stringify(alert));
      await redis.sadd(keys.alertList(userId), alertId);

      // Save user profile if email/telegram provided
      if (body.email || body.telegramChatId) {
        const existingProfile = await redis.get(keys.userProfile(userId));
        const profile = existingProfile
          ? (typeof existingProfile === 'string' ? JSON.parse(existingProfile) : existingProfile)
          : { userId, preferences: { digestMode: false } };

        if (body.email) profile.email = body.email;
        if (body.telegramChatId) profile.telegramChatId = body.telegramChatId;

        await redis.set(keys.userProfile(userId), JSON.stringify(profile));
      }

      return jsonResponse({ success: true, alert, userId });
    }

    // PATCH - Update alert
    if (method === 'PATCH') {
      const alertId = url.searchParams.get('id');
      const userId = url.searchParams.get('userId');

      if (!alertId || !userId) {
        return jsonResponse({ success: false, error: 'id and userId required' }, { status: 400 });
      }

      const data = await redis.get(keys.alert(userId, alertId));
      if (!data) {
        return jsonResponse({ success: false, error: 'Alert not found' }, { status: 404 });
      }

      const existing = typeof data === 'string' ? JSON.parse(data) : data;
      const body = await request.json();

      const updated = {
        ...existing,
        ...(body.keyword !== undefined && { keyword: body.keyword.trim() }),
        ...(body.priorityFilter !== undefined && { priorityFilter: body.priorityFilter }),
        ...(body.channels !== undefined && { channels: body.channels }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date().toISOString(),
      };

      await redis.set(keys.alert(userId, alertId), JSON.stringify(updated));

      return jsonResponse({ success: true, alert: updated });
    }

    // DELETE - Delete alert
    if (method === 'DELETE') {
      const alertId = url.searchParams.get('id');
      const userId = url.searchParams.get('userId');

      if (!alertId || !userId) {
        return jsonResponse({ success: false, error: 'id and userId required' }, { status: 400 });
      }

      await redis.del(keys.alert(userId, alertId));
      await redis.srem(keys.alertList(userId), alertId);

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: 'Method not allowed' }, { status: 405 });
  } catch (e) {
    console.error('[alerts API] Error:', e);
    return jsonResponse({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export default withCors(handler);

export const config = {
  runtime: 'edge',
};
