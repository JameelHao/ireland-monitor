/**
 * Push Storage Service
 *
 * Handles CRUD operations for push subscriptions using Upstash Redis.
 * Storage schema:
 * - push:subscriptions -> Set of subscription JSONs
 * - push:endpoint:{hash} -> Subscription JSON (for quick lookup)
 * - push:user:{userId} -> Set of subscription IDs
 */

import type {
  StoredPushSubscription,
  PushSubscriptionData,
} from '@/types/push';
import { PUSH_LIMITS } from '@/types/push';

// Redis client (lazy initialization)
let redisClient: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<void>;
  del: (key: string) => Promise<void>;
  sadd: (key: string, ...members: string[]) => Promise<void>;
  srem: (key: string, ...members: string[]) => Promise<void>;
  smembers: (key: string) => Promise<string[]>;
  scard: (key: string) => Promise<number>;
} | null = null;

/**
 * Initialize Redis client
 */
async function getRedis() {
  if (redisClient) return redisClient;

  const url = typeof process !== 'undefined' ? process.env?.UPSTASH_REDIS_REST_URL : undefined;
  const token = typeof process !== 'undefined' ? process.env?.UPSTASH_REDIS_REST_TOKEN : undefined;

  if (!url || !token) {
    console.warn('[PushStorage] Redis not configured');
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token }) as unknown as typeof redisClient;
    return redisClient;
  } catch (e) {
    console.error('[PushStorage] Failed to initialize Redis:', e);
    return null;
  }
}

/**
 * Generate unique subscription ID
 */
function generateSubscriptionId(): string {
  return `push_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Hash endpoint URL for key lookup
 */
function hashEndpoint(endpoint: string): string {
  // Simple hash for endpoint (in production, use proper hash)
  let hash = 0;
  for (let i = 0; i < endpoint.length; i++) {
    const char = endpoint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Storage key helpers
 */
const keys = {
  subscriptions: () => 'push:subscriptions',
  endpoint: (hash: string) => `push:endpoint:${hash}`,
  userSubscriptions: (userId: string) => `push:user:${userId}`,
};

/**
 * Push Storage class
 */
export class PushStorage {
  /**
   * Save a push subscription
   */
  async subscribe(
    subscription: PushSubscriptionData,
    userId?: string,
    userAgent?: string
  ): Promise<StoredPushSubscription> {
    const redis = await getRedis();
    if (!redis) {
      throw new Error('Redis not configured');
    }

    // Check if already subscribed
    const existing = await this.getByEndpoint(subscription.endpoint);
    if (existing) {
      // Update existing subscription
      existing.keys = subscription.keys;
      existing.isActive = true;
      if (userId) existing.userId = userId;
      if (userAgent) existing.userAgent = userAgent;

      await this.saveSubscription(existing);
      return existing;
    }

    // Check user subscription limit
    if (userId) {
      const userSubCount = await redis.scard(keys.userSubscriptions(userId));
      if (userSubCount >= PUSH_LIMITS.MAX_SUBSCRIPTIONS_PER_USER) {
        throw new Error(`Maximum ${PUSH_LIMITS.MAX_SUBSCRIPTIONS_PER_USER} subscriptions per user`);
      }
    }

    // Create new subscription
    const stored: StoredPushSubscription = {
      id: generateSubscriptionId(),
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      subscribedAt: new Date().toISOString(),
      isActive: true,
      userAgent,
    };

    await this.saveSubscription(stored);

    // Add to user's subscriptions if userId provided
    if (userId) {
      await redis.sadd(keys.userSubscriptions(userId), stored.id);
    }

    return stored;
  }

  /**
   * Save subscription to Redis
   */
  private async saveSubscription(subscription: StoredPushSubscription): Promise<void> {
    const redis = await getRedis();
    if (!redis) return;

    const endpointHash = hashEndpoint(subscription.endpoint);

    // Save subscription data
    await redis.set(
      keys.endpoint(endpointHash),
      JSON.stringify(subscription),
      { ex: PUSH_LIMITS.SUBSCRIPTION_TTL_DAYS * 24 * 3600 }
    );

    // Add to subscriptions set
    await redis.sadd(keys.subscriptions(), endpointHash);
  }

  /**
   * Get subscription by endpoint
   */
  async getByEndpoint(endpoint: string): Promise<StoredPushSubscription | null> {
    const redis = await getRedis();
    if (!redis) return null;

    const hash = hashEndpoint(endpoint);
    const data = await redis.get(keys.endpoint(hash));

    if (!data) return null;

    try {
      return JSON.parse(data) as StoredPushSubscription;
    } catch {
      return null;
    }
  }

  /**
   * Unsubscribe by endpoint
   */
  async unsubscribe(endpoint: string): Promise<boolean> {
    const redis = await getRedis();
    if (!redis) return false;

    const subscription = await this.getByEndpoint(endpoint);
    if (!subscription) return false;

    const hash = hashEndpoint(endpoint);

    // Remove from Redis
    await redis.del(keys.endpoint(hash));
    await redis.srem(keys.subscriptions(), hash);

    // Remove from user's subscriptions
    if (subscription.userId) {
      await redis.srem(keys.userSubscriptions(subscription.userId), subscription.id);
    }

    return true;
  }

  /**
   * Get all active subscriptions
   */
  async getAllSubscriptions(): Promise<StoredPushSubscription[]> {
    const redis = await getRedis();
    if (!redis) return [];

    const hashes = await redis.smembers(keys.subscriptions());
    const subscriptions: StoredPushSubscription[] = [];

    for (const hash of hashes) {
      const data = await redis.get(keys.endpoint(hash));
      if (data) {
        try {
          const sub = JSON.parse(data) as StoredPushSubscription;
          if (sub.isActive) {
            subscriptions.push(sub);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    return subscriptions;
  }

  /**
   * Get subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<StoredPushSubscription[]> {
    const all = await this.getAllSubscriptions();
    return all.filter((s) => s.userId === userId);
  }

  /**
   * Update last notification time
   */
  async updateLastNotification(endpoint: string): Promise<void> {
    const subscription = await this.getByEndpoint(endpoint);
    if (subscription) {
      subscription.lastNotificationAt = new Date().toISOString();
      await this.saveSubscription(subscription);
    }
  }

  /**
   * Mark subscription as inactive
   */
  async markInactive(endpoint: string): Promise<void> {
    const subscription = await this.getByEndpoint(endpoint);
    if (subscription) {
      subscription.isActive = false;
      await this.saveSubscription(subscription);
    }
  }

  /**
   * Get subscription count
   */
  async getSubscriptionCount(): Promise<number> {
    const redis = await getRedis();
    if (!redis) return 0;

    return await redis.scard(keys.subscriptions());
  }
}

// Export singleton
export const pushStorage = new PushStorage();
