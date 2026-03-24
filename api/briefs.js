/**
 * Briefs API
 *
 * AI-powered daily brief generation and subscription.
 * Uses Upstash REST API for Edge Function compatibility.
 *
 * Routes:
 * - GET /api/briefs?date=YYYY-MM-DD&lang=en - Get brief for date
 * - GET /api/briefs?today=true&lang=en - Get today's brief
 * - GET /api/briefs?latest=true&lang=en - Get latest available brief
 * - POST /api/briefs/subscribe - Subscribe to email briefs
 * - POST /api/briefs/unsubscribe - Unsubscribe from briefs
 */

import { jsonResponse } from './_json-response.js';
import { withCors } from './_cors.js';

// Redis key helpers
const keys = {
  brief: (date, lang) => `briefs:${date}:${lang}`,
  latest: (lang) => `briefs:latest:${lang}`,
  subscribers: () => 'briefs:subscribers',
};

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

async function redisSmembers(key) {
  const result = await redisCmd('smembers', key);
  return result || [];
}

async function redisSadd(key, member) {
  return redisCmd('sadd', key, member);
}

async function redisSrem(key, member) {
  return redisCmd('srem', key, member);
}

// Generate subscriber ID
function generateSubscriberId() {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    // POST /api/briefs/subscribe
    if (method === 'POST' && path.endsWith('/subscribe')) {
      const body = await request.json();
      const { email, language = 'en' } = body;

      if (!email || !isValidEmail(email)) {
        return jsonResponse({ success: false, error: 'Valid email required' }, { status: 400 });
      }

      if (language !== 'en' && language !== 'zh') {
        return jsonResponse({ success: false, error: 'Language must be "en" or "zh"' }, { status: 400 });
      }

      // Check if already subscribed
      const subscribers = await redisSmembers(keys.subscribers());
      let existingData = null;
      for (const data of subscribers) {
        try {
          const sub = JSON.parse(data);
          if (sub.email.toLowerCase() === email.toLowerCase()) {
            existingData = data;
            break;
          }
        } catch {
          // Skip
        }
      }

      // Remove existing if different language
      if (existingData) {
        const existing = JSON.parse(existingData);
        if (existing.language === language) {
          return jsonResponse({ success: true, subscriber: existing, message: 'Already subscribed' });
        }
        await redisSrem(keys.subscribers(), existingData);
      }

      const subscriber = {
        id: generateSubscriberId(),
        email: email.toLowerCase(),
        language,
        subscribedAt: new Date().toISOString(),
        isActive: true,
      };

      await redisSadd(keys.subscribers(), JSON.stringify(subscriber));

      return jsonResponse({ success: true, subscriber });
    }

    // POST /api/briefs/unsubscribe
    if (method === 'POST' && path.endsWith('/unsubscribe')) {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return jsonResponse({ success: false, error: 'Email required' }, { status: 400 });
      }

      const subscribers = await redisSmembers(keys.subscribers());
      for (const data of subscribers) {
        try {
          const sub = JSON.parse(data);
          if (sub.email.toLowerCase() === email.toLowerCase()) {
            await redisSrem(keys.subscribers(), data);
            return jsonResponse({ success: true, message: 'Unsubscribed' });
          }
        } catch {
          // Skip
        }
      }

      return jsonResponse({ success: true, message: 'Not subscribed' });
    }

    // GET requests
    if (method === 'GET') {
      const lang = reqUrl.searchParams.get('lang') || 'en';
      if (lang !== 'en' && lang !== 'zh') {
        return jsonResponse({ success: false, error: 'Language must be "en" or "zh"' }, { status: 400 });
      }

      // Get today's brief
      const today = reqUrl.searchParams.get('today');
      if (today === 'true') {
        const todayDate = new Date().toISOString().split('T')[0];
        const brief = await redisGet(keys.brief(todayDate, lang));
        if (!brief) {
          return jsonResponse({ success: false, error: 'No brief available for today' }, { status: 404 });
        }
        return jsonResponse({ success: true, brief });
      }

      // Get latest brief
      const latest = reqUrl.searchParams.get('latest');
      if (latest === 'true') {
        const latestDate = await redisCmd('get', keys.latest(lang));
        if (!latestDate) {
          return jsonResponse({ success: false, error: 'No briefs available' }, { status: 404 });
        }
        const brief = await redisGet(keys.brief(latestDate, lang));
        if (!brief) {
          return jsonResponse({ success: false, error: 'Brief not found' }, { status: 404 });
        }
        return jsonResponse({ success: true, brief });
      }

      // Get brief by date
      const date = reqUrl.searchParams.get('date');
      if (date) {
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return jsonResponse({ success: false, error: 'Date must be YYYY-MM-DD' }, { status: 400 });
        }
        const brief = await redisGet(keys.brief(date, lang));
        if (!brief) {
          return jsonResponse({ success: false, error: 'Brief not found for date' }, { status: 404 });
        }
        return jsonResponse({ success: true, brief });
      }

      // Default: return latest
      const latestDate = await redisCmd('get', keys.latest(lang));
      if (latestDate) {
        const brief = await redisGet(keys.brief(latestDate, lang));
        if (brief) {
          return jsonResponse({ success: true, brief });
        }
      }

      return jsonResponse({ success: false, error: 'No briefs available' }, { status: 404 });
    }

    return jsonResponse({ success: false, error: 'Method not allowed' }, { status: 405 });
  } catch (e) {
    console.error('[briefs API] Error:', e);
    return jsonResponse({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export default withCors(handler);

export const config = {
  runtime: 'edge',
};
