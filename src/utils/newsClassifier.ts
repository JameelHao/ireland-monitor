/**
 * News Classifier Utility
 *
 * Classifies news items into visual tiers for display hierarchy.
 * - Tier 1 (Important): Breaking news, major funding, M&A, tier-1 companies
 * - Tier 2 (Standard): Default news items
 * - Tier 3 (Minor): Old news (>72h)
 */

import type { ClusteredEvent, NewsItem } from '@/types';

/**
 * News visual tier for display hierarchy
 */
export enum NewsTier {
  Important = 1,
  Standard = 2,
  Minor = 3,
}

/**
 * Tier-1 (major) company keywords - news from these companies gets priority
 */
const TIER1_COMPANIES = [
  'google',
  'meta',
  'facebook',
  'apple',
  'microsoft',
  'amazon',
  'aws',
  'intel',
  'nvidia',
  'openai',
  'anthropic',
  'stripe',
  'salesforce',
  'oracle',
  'ibm',
  'cisco',
  'vmware',
  'adobe',
  'linkedin',
  'twitter',
  'x corp',
  'paypal',
  'airbnb',
  'uber',
  'spotify',
  'netflix',
  'zoom',
  'slack',
  'atlassian',
  'hubspot',
  'intercom',
  'tiktok',
  'bytedance',
];

/**
 * M&A keywords for identifying merger/acquisition news
 */
const MA_KEYWORDS = [
  'acquires',
  'acquired',
  'acquisition',
  'acquiring',
  'merger',
  'merges',
  'merged',
  'takeover',
  'takes over',
  'bought by',
  'buys',
  'purchase of',
  'purchasing',
];

/**
 * Breaking news indicators
 */
const BREAKING_KEYWORDS = ['breaking', 'just in', 'developing', 'urgent', 'alert'];

/**
 * Extract funding amount from title in EUR or USD
 * Returns amount in EUR (converts USD at approximate rate)
 */
export function extractFundingAmount(title: string): number | null {
  const lowerTitle = title.toLowerCase();

  // Match patterns like: "raises €40M", "secures $100 million", "funding of €5.5m"
  const patterns = [
    // EUR patterns
    /(?:raises?|secures?|funding|raised|secured|series [a-z])\s*(?:of\s*)?€\s*(\d+(?:\.\d+)?)\s*(m|million|bn|billion)/gi,
    /€\s*(\d+(?:\.\d+)?)\s*(m|million|bn|billion)\s*(?:funding|round|investment|raise)/gi,
    // USD patterns (convert at ~0.92 EUR/USD)
    /(?:raises?|secures?|funding|raised|secured|series [a-z])\s*(?:of\s*)?\$\s*(\d+(?:\.\d+)?)\s*(m|million|bn|billion)/gi,
    /\$\s*(\d+(?:\.\d+)?)\s*(m|million|bn|billion)\s*(?:funding|round|investment|raise)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(lowerTitle);
    if (match) {
      const value = parseFloat(match[1] ?? '0');
      const unit = (match[2] ?? '').toLowerCase();
      const isUSD = lowerTitle.includes('$');

      let amount = value;
      if (unit === 'bn' || unit === 'billion') {
        amount = value * 1_000_000_000;
      } else if (unit === 'm' || unit === 'million') {
        amount = value * 1_000_000;
      }

      // Convert USD to EUR at approximate rate
      if (isUSD) {
        amount = amount * 0.92;
      }

      return amount;
    }
  }

  return null;
}

/**
 * Check if title contains M&A keywords
 */
export function isMergerAcquisition(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return MA_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
}

/**
 * Check if title contains breaking news indicators
 */
export function isBreakingNews(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return BREAKING_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
}

/**
 * Check if news is from a tier-1 (major) company
 */
export function isTier1Company(title: string, source: string): boolean {
  const combined = `${title} ${source}`.toLowerCase();
  return TIER1_COMPANIES.some((company) => combined.includes(company));
}

/**
 * Calculate hours since a given date
 */
export function getHoursAgo(date: Date): number {
  const now = Date.now();
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime();
  return (now - then) / (1000 * 60 * 60);
}

/**
 * Classify a clustered news event into a visual tier
 */
export function classifyCluster(cluster: ClusteredEvent): NewsTier {
  const hoursAgo = getHoursAgo(cluster.lastUpdated);
  const title = cluster.primaryTitle;
  const source = cluster.primarySource;

  // Tier 1: Important news
  // - Breaking news (based on isAlert flag or keywords)
  if (cluster.isAlert || isBreakingNews(title)) {
    return NewsTier.Important;
  }

  // - Major funding (≥€10M)
  const fundingAmount = extractFundingAmount(title);
  if (fundingAmount !== null && fundingAmount >= 10_000_000) {
    return NewsTier.Important;
  }

  // - M&A news
  if (isMergerAcquisition(title)) {
    return NewsTier.Important;
  }

  // - Tier-1 company news (within 24h)
  if (isTier1Company(title, source) && hoursAgo < 24) {
    return NewsTier.Important;
  }

  // - High threat level news
  if (cluster.threat?.level === 'critical' || cluster.threat?.level === 'high') {
    return NewsTier.Important;
  }

  // - High velocity news (trending) - spike indicates rapid story growth
  if (cluster.velocity?.level === 'spike') {
    return NewsTier.Important;
  }

  // Tier 3: Minor (old) news
  if (hoursAgo > 72) {
    return NewsTier.Minor;
  }

  // Tier 2: Standard news (default)
  return NewsTier.Standard;
}

/**
 * Classify a single news item into a visual tier
 */
export function classifyNewsItem(item: NewsItem): NewsTier {
  const pubDate = item.pubDate instanceof Date ? item.pubDate : new Date(item.pubDate);
  const hoursAgo = getHoursAgo(pubDate);
  const title = item.title;
  const source = item.source;

  // Tier 1: Important news
  if (item.isAlert || isBreakingNews(title)) {
    return NewsTier.Important;
  }

  const fundingAmount = extractFundingAmount(title);
  if (fundingAmount !== null && fundingAmount >= 10_000_000) {
    return NewsTier.Important;
  }

  if (isMergerAcquisition(title)) {
    return NewsTier.Important;
  }

  if (isTier1Company(title, source) && hoursAgo < 24) {
    return NewsTier.Important;
  }

  // Tier 3: Minor (old) news
  if (hoursAgo > 72) {
    return NewsTier.Minor;
  }

  // Tier 2: Standard news (default)
  return NewsTier.Standard;
}

/**
 * Check if news should show "HOT" badge (Tier 1 + recent)
 */
export function shouldShowHotBadge(tier: NewsTier, date: Date): boolean {
  if (tier !== NewsTier.Important) return false;
  const hoursAgo = getHoursAgo(date);
  return hoursAgo < 24;
}

/**
 * Get CSS class suffix for a tier
 */
export function getTierClassName(tier: NewsTier): string {
  return `tier-${tier}`;
}
