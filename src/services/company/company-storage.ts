/**
 * Company Storage Service
 *
 * Handles company data retrieval with Redis caching.
 * Combines static data with cached external API data.
 *
 * Storage schema:
 * - companies:{slug} -> Company JSON (cached)
 * - companies:news:{slug} -> News items JSON (cached)
 */

import type {
  Company,
  CompanyFilters,
  CompanySearchResponse,
  CompanyNewsItem,
} from '@/types/company';
import { COMPANY_LIMITS } from '@/types/company';
import {
  IRELAND_COMPANIES,
  getCompanyBySlug as getStaticCompany,
  getCompaniesByTag,
  getCompaniesByIndustry,
} from '@/data/ireland-companies';

// Redis client (lazy initialization)
let redisClient: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<void>;
  del: (key: string) => Promise<void>;
} | null = null;

/**
 * Initialize Redis client
 */
async function getRedis() {
  if (redisClient) return redisClient;

  const url = typeof process !== 'undefined' ? process.env?.UPSTASH_REDIS_REST_URL : undefined;
  const token = typeof process !== 'undefined' ? process.env?.UPSTASH_REDIS_REST_TOKEN : undefined;

  if (!url || !token) {
    console.warn('[CompanyStorage] Redis not configured, using static data only');
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token }) as unknown as typeof redisClient;
    return redisClient;
  } catch (e) {
    console.error('[CompanyStorage] Failed to initialize Redis:', e);
    return null;
  }
}

/**
 * Storage key helpers
 */
const keys = {
  company: (slug: string) => `companies:${slug}`,
  news: (slug: string) => `companies:news:${slug}`,
};

/**
 * Company Storage class
 */
export class CompanyStorage {
  /**
   * Get company by slug
   * Checks cache first, then falls back to static data
   */
  async getCompany(slug: string): Promise<Company | null> {
    // Try cache first
    const redis = await getRedis();
    if (redis) {
      const cached = await redis.get(keys.company(slug));
      if (cached) {
        try {
          return JSON.parse(cached) as Company;
        } catch {
          // Fall through to static
        }
      }
    }

    // Fall back to static data
    return getStaticCompany(slug) || null;
  }

  /**
   * Search companies with filters
   */
  async searchCompanies(filters: CompanyFilters = {}): Promise<CompanySearchResponse> {
    let companies = [...IRELAND_COMPANIES];

    // Apply search query
    if (filters.q) {
      const q = filters.q.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q)
      );
    }

    // Filter by industry
    if (filters.industry) {
      companies = companies.filter((c) => c.industry === filters.industry);
    }

    // Filter by tag
    if (filters.tag) {
      companies = companies.filter((c) => c.tags?.includes(filters.tag!));
    }

    // Filter by location
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      companies = companies.filter((c) =>
        c.headquarters.toLowerCase().includes(loc)
      );
    }

    const total = companies.length;

    // Pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || COMPANY_LIMITS.DEFAULT_PAGE_SIZE;
    companies = companies.slice(offset, offset + limit);

    return { companies, total, filters };
  }

  /**
   * Get company news
   * Returns cached news or empty array
   */
  async getCompanyNews(slug: string, limit = 20): Promise<CompanyNewsItem[]> {
    const redis = await getRedis();
    if (!redis) return [];

    const cached = await redis.get(keys.news(slug));
    if (!cached) return [];

    try {
      const news = JSON.parse(cached) as CompanyNewsItem[];
      return news.slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Cache company news
   */
  async cacheCompanyNews(slug: string, news: CompanyNewsItem[]): Promise<void> {
    const redis = await getRedis();
    if (!redis) return;

    await redis.set(keys.news(slug), JSON.stringify(news), {
      ex: COMPANY_LIMITS.CACHE_TTL_SECONDS,
    });
  }

  /**
   * Cache company data (for external API results)
   */
  async cacheCompany(company: Company): Promise<void> {
    const redis = await getRedis();
    if (!redis) return;

    await redis.set(keys.company(company.slug), JSON.stringify(company), {
      ex: COMPANY_LIMITS.CACHE_TTL_SECONDS,
    });
  }

  /**
   * Get all companies
   */
  async getAllCompanies(): Promise<Company[]> {
    return IRELAND_COMPANIES;
  }

  /**
   * Get companies by tag
   */
  async getByTag(tag: string): Promise<Company[]> {
    return getCompaniesByTag(tag);
  }

  /**
   * Get companies by industry
   */
  async getByIndustry(industry: string): Promise<Company[]> {
    return getCompaniesByIndustry(industry);
  }

  /**
   * Get company count
   */
  async getCompanyCount(): Promise<number> {
    return IRELAND_COMPANIES.length;
  }

  /**
   * Get all industries
   */
  getIndustries(): string[] {
    const industries = new Set<string>();
    for (const company of IRELAND_COMPANIES) {
      industries.add(company.industry);
    }
    return Array.from(industries).sort();
  }

  /**
   * Get all tags
   */
  getTags(): string[] {
    const tags = new Set<string>();
    for (const company of IRELAND_COMPANIES) {
      if (company.tags) {
        for (const tag of company.tags) {
          tags.add(tag);
        }
      }
    }
    return Array.from(tags).sort();
  }
}

// Export singleton
export const companyStorage = new CompanyStorage();
