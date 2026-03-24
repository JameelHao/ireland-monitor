/**
 * Brief Storage Service
 *
 * Handles CRUD operations for daily briefs using Upstash Redis.
 * Storage schema:
 * - briefs:{date}:{lang} -> Brief JSON
 * - briefs:subscribers -> Set of subscriber JSONs
 * - briefs:latest:{lang} -> Latest brief date
 */

import type {
  DailyBrief,
  BriefSubscriber,
  BriefLanguage,
} from '@/types/brief';

// Redis client (lazy initialization)
let redisClient: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<void>;
  del: (key: string) => Promise<void>;
  sadd: (key: string, ...members: string[]) => Promise<void>;
  srem: (key: string, ...members: string[]) => Promise<void>;
  smembers: (key: string) => Promise<string[]>;
} | null = null;

/**
 * Initialize Redis client
 */
async function getRedis() {
  if (redisClient) return redisClient;

  const url = typeof process !== 'undefined' ? process.env?.UPSTASH_REDIS_REST_URL : undefined;
  const token = typeof process !== 'undefined' ? process.env?.UPSTASH_REDIS_REST_TOKEN : undefined;

  if (!url || !token) {
    console.warn('[BriefStorage] Redis not configured');
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token }) as unknown as typeof redisClient;
    return redisClient;
  } catch (e) {
    console.error('[BriefStorage] Failed to initialize Redis:', e);
    return null;
  }
}

/**
 * Generate unique subscriber ID
 */
function generateSubscriberId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Storage key helpers
 */
const keys = {
  brief: (date: string, lang: BriefLanguage) => `briefs:${date}:${lang}`,
  latest: (lang: BriefLanguage) => `briefs:latest:${lang}`,
  subscribers: () => 'briefs:subscribers',
};

/**
 * Brief Storage class
 */
export class BriefStorage {
  /**
   * Save a daily brief
   */
  async saveBrief(brief: DailyBrief): Promise<void> {
    const redis = await getRedis();
    if (!redis) {
      throw new Error('Redis not configured');
    }

    // Save brief with 7-day TTL
    await redis.set(keys.brief(brief.date, brief.language), JSON.stringify(brief), {
      ex: 7 * 24 * 3600,
    });

    // Update latest pointer
    await redis.set(keys.latest(brief.language), brief.date);
  }

  /**
   * Get brief for a specific date and language
   */
  async getBrief(date: string, language: BriefLanguage): Promise<DailyBrief | null> {
    const redis = await getRedis();
    if (!redis) return null;

    const data = await redis.get(keys.brief(date, language));
    if (!data) return null;

    try {
      return JSON.parse(data) as DailyBrief;
    } catch {
      return null;
    }
  }

  /**
   * Get today's brief
   */
  async getTodayBrief(language: BriefLanguage): Promise<DailyBrief | null> {
    const todayDate = new Date().toISOString().split('T')[0];
    if (!todayDate) return null;
    return this.getBrief(todayDate, language);
  }

  /**
   * Get the latest available brief
   */
  async getLatestBrief(language: BriefLanguage): Promise<DailyBrief | null> {
    const redis = await getRedis();
    if (!redis) return null;

    const latestDate = await redis.get(keys.latest(language));
    if (!latestDate) return null;

    return this.getBrief(latestDate, language);
  }

  /**
   * Check if brief exists for date
   */
  async briefExists(date: string, language: BriefLanguage): Promise<boolean> {
    const brief = await this.getBrief(date, language);
    return brief !== null;
  }

  /**
   * Subscribe to email briefs
   */
  async subscribe(email: string, language: BriefLanguage = 'en'): Promise<BriefSubscriber> {
    const redis = await getRedis();
    if (!redis) {
      throw new Error('Redis not configured');
    }

    // Check if already subscribed
    const existing = await this.getSubscriberByEmail(email);
    if (existing) {
      // Update language if different
      if (existing.language !== language) {
        await this.unsubscribe(email);
      } else {
        return existing;
      }
    }

    const subscriber: BriefSubscriber = {
      id: generateSubscriberId(),
      email,
      language,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    };

    await redis.sadd(keys.subscribers(), JSON.stringify(subscriber));

    return subscriber;
  }

  /**
   * Unsubscribe from email briefs
   */
  async unsubscribe(email: string): Promise<boolean> {
    const redis = await getRedis();
    if (!redis) return false;

    const subscribers = await redis.smembers(keys.subscribers());
    for (const data of subscribers) {
      try {
        const sub = JSON.parse(data) as BriefSubscriber;
        if (sub.email.toLowerCase() === email.toLowerCase()) {
          await redis.srem(keys.subscribers(), data);
          return true;
        }
      } catch {
        // Skip invalid
      }
    }

    return false;
  }

  /**
   * Get subscriber by email
   */
  async getSubscriberByEmail(email: string): Promise<BriefSubscriber | null> {
    const redis = await getRedis();
    if (!redis) return null;

    const subscribers = await redis.smembers(keys.subscribers());
    for (const data of subscribers) {
      try {
        const sub = JSON.parse(data) as BriefSubscriber;
        if (sub.email.toLowerCase() === email.toLowerCase()) {
          return sub;
        }
      } catch {
        // Skip invalid
      }
    }

    return null;
  }

  /**
   * Get all active subscribers
   */
  async getAllSubscribers(): Promise<BriefSubscriber[]> {
    const redis = await getRedis();
    if (!redis) return [];

    const subscribers = await redis.smembers(keys.subscribers());
    const result: BriefSubscriber[] = [];

    for (const data of subscribers) {
      try {
        const sub = JSON.parse(data) as BriefSubscriber;
        if (sub.isActive) {
          result.push(sub);
        }
      } catch {
        // Skip invalid
      }
    }

    return result;
  }

  /**
   * Get subscribers by language
   */
  async getSubscribersByLanguage(language: BriefLanguage): Promise<BriefSubscriber[]> {
    const all = await this.getAllSubscribers();
    return all.filter((s) => s.language === language);
  }
}

// Export singleton
export const briefStorage = new BriefStorage();
