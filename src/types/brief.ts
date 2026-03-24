/**
 * Brief Types for AI Daily Brief
 *
 * Data structures for AI-generated daily news briefs.
 */

/** Supported languages for briefs */
export type BriefLanguage = 'en' | 'zh';

/**
 * A single highlight item in the brief
 */
export interface BriefHighlight {
  /** Headline of the highlight */
  title: string;
  /** Key takeaway or impact */
  takeaway: string;
  /** Related company/organization */
  company?: string;
  /** Original news source URL */
  sourceUrl?: string;
}

/**
 * Statistics/numbers section
 */
export interface BriefNumbers {
  /** Total funding amount mentioned */
  totalFunding?: string;
  /** Number of M&A deals */
  maDeals?: number;
  /** New jobs announced */
  newJobs?: number;
  /** Most active sector */
  topSector?: string;
  /** Sector distribution percentage */
  sectorBreakdown?: Record<string, number>;
}

/**
 * A trend observation
 */
export interface BriefTrend {
  /** Trend description */
  description: string;
  /** Evidence/examples */
  evidence?: string[];
}

/**
 * Upcoming event/item to watch
 */
export interface BriefWatchItem {
  /** Event/item name */
  name: string;
  /** Date if known */
  date?: string;
  /** Brief description */
  description?: string;
}

/**
 * Complete daily brief structure
 */
export interface DailyBrief {
  /** Unique brief ID */
  id: string;
  /** Brief date (YYYY-MM-DD) */
  date: string;
  /** Language of the brief */
  language: BriefLanguage;
  /** Top highlights (3-5 items) */
  highlights: BriefHighlight[];
  /** Key numbers/statistics */
  numbers: BriefNumbers;
  /** Emerging trends */
  trends: BriefTrend[];
  /** Items to watch this week */
  watchList: BriefWatchItem[];
  /** Full markdown content */
  content: string;
  /** Number of news articles analyzed */
  newsCount: number;
  /** OpenAI tokens used */
  tokenUsage?: number;
  /** When the brief was generated */
  generatedAt: string;
}

/**
 * Brief subscriber for email notifications
 */
export interface BriefSubscriber {
  /** Unique subscriber ID */
  id: string;
  /** Email address */
  email: string;
  /** Preferred language */
  language: BriefLanguage;
  /** When subscribed */
  subscribedAt: string;
  /** Is subscription active */
  isActive: boolean;
}

/**
 * Brief generation request
 */
export interface BriefGenerateRequest {
  /** Target date (defaults to today) */
  date?: string;
  /** Language to generate */
  language: BriefLanguage;
  /** Force regenerate even if exists */
  force?: boolean;
}

/**
 * Brief API response
 */
export interface BriefResponse {
  success: boolean;
  brief?: DailyBrief;
  error?: string;
}

/**
 * Subscribe request
 */
export interface BriefSubscribeRequest {
  email: string;
  language?: BriefLanguage;
}

// Constants
export const BRIEF_LIMITS = {
  /** Minimum news articles to generate brief */
  MIN_NEWS_COUNT: 5,
  /** Maximum highlights in brief */
  MAX_HIGHLIGHTS: 5,
  /** Maximum trends in brief */
  MAX_TRENDS: 3,
  /** Maximum watch items */
  MAX_WATCH_ITEMS: 4,
  /** Brief cache TTL (24 hours) */
  CACHE_TTL_SECONDS: 86400,
  /** Maximum token budget for generation */
  MAX_TOKENS: 2000,
};

/**
 * GPT-4 prompt template for brief generation
 */
export const BRIEF_PROMPT_TEMPLATE = `You are an expert analyst of Ireland's tech ecosystem, writing for IrishTech Daily.

Analyze these {newsCount} news articles from the past 24 hours and generate a concise daily brief.

News Articles:
{newsContent}

Generate a JSON response with this structure:
{
  "highlights": [
    { "title": "...", "takeaway": "...", "company": "..." }
  ],
  "numbers": {
    "totalFunding": "€X million",
    "maDeals": X,
    "newJobs": X,
    "topSector": "..."
  },
  "trends": [
    { "description": "...", "evidence": ["..."] }
  ],
  "watchList": [
    { "name": "...", "date": "...", "description": "..." }
  ],
  "content": "Full markdown brief with emojis and sections"
}

Requirements:
- Highlights: 3-5 most impactful news, with clear takeaways
- Numbers: Extract concrete data (funding, jobs, deals)
- Trends: Identify patterns across multiple articles
- WatchList: Upcoming events or announcements to follow
- Content: Well-formatted markdown with sections

Be analytical, not just summarizing. Identify connections and implications.
{languageInstruction}`;
