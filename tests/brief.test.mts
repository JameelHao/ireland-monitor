/**
 * Brief Service Tests
 *
 * Tests for AI daily brief types, generation, and parsing.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  DailyBrief,
  BriefHighlight,
  BriefNumbers,
  BriefTrend,
  BriefWatchItem,
  BriefSubscriber,
  BriefLanguage,
} from '../src/types/brief.js';
import { BRIEF_LIMITS, BRIEF_PROMPT_TEMPLATE } from '../src/types/brief.js';

describe('Brief Types', () => {
  it('DailyBrief should have required fields', () => {
    const brief: DailyBrief = {
      id: 'brief_123',
      date: '2026-03-24',
      language: 'en',
      highlights: [
        { title: 'Intel expansion', takeaway: '3000 new jobs', company: 'Intel' },
      ],
      numbers: { totalFunding: '€450M', maDeals: 3, newJobs: 4500, topSector: 'AI' },
      trends: [{ description: 'AI adoption rising', evidence: ['example1'] }],
      watchList: [{ name: 'Web Summit', date: '2026-03-26' }],
      content: '# Brief content',
      newsCount: 25,
      generatedAt: '2026-03-24T07:00:00Z',
    };

    assert.equal(brief.id, 'brief_123');
    assert.equal(brief.date, '2026-03-24');
    assert.equal(brief.language, 'en');
    assert.equal(brief.highlights.length, 1);
    assert.equal(brief.highlights[0].company, 'Intel');
    assert.equal(brief.numbers.totalFunding, '€450M');
    assert.equal(brief.newsCount, 25);
  });

  it('BriefHighlight should support optional fields', () => {
    const highlight: BriefHighlight = {
      title: 'Test headline',
      takeaway: 'Key impact',
    };

    assert.equal(highlight.title, 'Test headline');
    assert.equal(highlight.company, undefined);
    assert.equal(highlight.sourceUrl, undefined);
  });

  it('BriefSubscriber should have required fields', () => {
    const subscriber: BriefSubscriber = {
      id: 'sub_123',
      email: 'user@example.com',
      language: 'en',
      subscribedAt: '2026-03-24T00:00:00Z',
      isActive: true,
    };

    assert.equal(subscriber.email, 'user@example.com');
    assert.equal(subscriber.language, 'en');
    assert.equal(subscriber.isActive, true);
  });
});

describe('Brief Constants', () => {
  it('BRIEF_LIMITS should have correct values', () => {
    assert.equal(BRIEF_LIMITS.MIN_NEWS_COUNT, 5);
    assert.equal(BRIEF_LIMITS.MAX_HIGHLIGHTS, 5);
    assert.equal(BRIEF_LIMITS.MAX_TRENDS, 3);
    assert.equal(BRIEF_LIMITS.MAX_WATCH_ITEMS, 4);
    assert.equal(BRIEF_LIMITS.CACHE_TTL_SECONDS, 86400);
    assert.equal(BRIEF_LIMITS.MAX_TOKENS, 2000);
  });

  it('BRIEF_PROMPT_TEMPLATE should contain placeholders', () => {
    assert.ok(BRIEF_PROMPT_TEMPLATE.includes('{newsCount}'));
    assert.ok(BRIEF_PROMPT_TEMPLATE.includes('{newsContent}'));
    assert.ok(BRIEF_PROMPT_TEMPLATE.includes('{languageInstruction}'));
  });
});

describe('Brief Language Support', () => {
  it('should support English language', () => {
    const lang: BriefLanguage = 'en';
    assert.equal(lang, 'en');
  });

  it('should support Chinese language', () => {
    const lang: BriefLanguage = 'zh';
    assert.equal(lang, 'zh');
  });
});

describe('Brief Numbers Parsing', () => {
  // Helper to parse funding string to number
  function parseFunding(str: string): number {
    const match = str.match(/€?([\d.]+)\s*(M|B|K)?/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = (match[2] || '').toUpperCase();

    switch (unit) {
      case 'B':
        return value * 1_000_000_000;
      case 'M':
        return value * 1_000_000;
      case 'K':
        return value * 1_000;
      default:
        return value;
    }
  }

  it('should parse millions', () => {
    assert.equal(parseFunding('€450M'), 450_000_000);
    assert.equal(parseFunding('€1.5M'), 1_500_000);
  });

  it('should parse billions', () => {
    assert.equal(parseFunding('€5B'), 5_000_000_000);
    assert.equal(parseFunding('€2.5B'), 2_500_000_000);
  });

  it('should parse thousands', () => {
    assert.equal(parseFunding('€500K'), 500_000);
  });

  it('should handle plain numbers', () => {
    assert.equal(parseFunding('€1000000'), 1_000_000);
  });
});

describe('Brief Date Formatting', () => {
  function formatBriefDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  it('should format date as YYYY-MM-DD', () => {
    const date = new Date('2026-03-24T08:00:00Z');
    assert.equal(formatBriefDate(date), '2026-03-24');
  });

  it('should handle different dates', () => {
    const date1 = new Date('2026-01-01T00:00:00Z');
    const date2 = new Date('2026-12-31T23:59:59Z');

    assert.equal(formatBriefDate(date1), '2026-01-01');
    assert.equal(formatBriefDate(date2), '2026-12-31');
  });
});

describe('Brief Content Validation', () => {
  function isValidBrief(brief: Partial<DailyBrief>): boolean {
    if (!brief.id || !brief.date || !brief.language) return false;
    if (!brief.highlights || !Array.isArray(brief.highlights)) return false;
    if (!brief.content || typeof brief.content !== 'string') return false;
    return true;
  }

  it('should validate complete brief', () => {
    const brief: DailyBrief = {
      id: 'brief_123',
      date: '2026-03-24',
      language: 'en',
      highlights: [],
      numbers: {},
      trends: [],
      watchList: [],
      content: '# Brief',
      newsCount: 0,
      generatedAt: new Date().toISOString(),
    };

    assert.ok(isValidBrief(brief));
  });

  it('should reject brief without id', () => {
    const brief = {
      date: '2026-03-24',
      language: 'en' as BriefLanguage,
      highlights: [],
      content: '# Brief',
    };

    assert.ok(!isValidBrief(brief));
  });

  it('should reject brief without content', () => {
    const brief = {
      id: 'brief_123',
      date: '2026-03-24',
      language: 'en' as BriefLanguage,
      highlights: [],
    };

    assert.ok(!isValidBrief(brief));
  });
});

describe('GPT Response Parsing', () => {
  // Helper to parse GPT response
  function parseGPTResponse(content: string): { highlights: BriefHighlight[]; numbers: BriefNumbers } | null {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        highlights: parsed.highlights || [],
        numbers: parsed.numbers || {},
      };
    } catch {
      return null;
    }
  }

  it('should parse valid JSON response', () => {
    const response = `Here is the analysis:
{
  "highlights": [{ "title": "Test", "takeaway": "Impact" }],
  "numbers": { "totalFunding": "€100M" }
}`;

    const result = parseGPTResponse(response);
    assert.ok(result);
    assert.equal(result.highlights.length, 1);
    assert.equal(result.highlights[0].title, 'Test');
    assert.equal(result.numbers.totalFunding, '€100M');
  });

  it('should handle JSON with extra text', () => {
    const response = `Based on my analysis, here is the brief:

{
  "highlights": [],
  "numbers": { "maDeals": 5 }
}

This concludes the brief.`;

    const result = parseGPTResponse(response);
    assert.ok(result);
    assert.equal(result.numbers.maDeals, 5);
  });

  it('should return null for invalid JSON', () => {
    const response = 'No JSON here, just plain text';
    const result = parseGPTResponse(response);
    assert.equal(result, null);
  });

  it('should return null for malformed JSON', () => {
    const response = '{ "highlights": [invalid] }';
    const result = parseGPTResponse(response);
    assert.equal(result, null);
  });
});

describe('Email Validation', () => {
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  it('should accept valid emails', () => {
    assert.ok(isValidEmail('user@example.com'));
    assert.ok(isValidEmail('test.user@domain.co.uk'));
    assert.ok(isValidEmail('user+tag@gmail.com'));
  });

  it('should reject invalid emails', () => {
    assert.ok(!isValidEmail('invalid'));
    assert.ok(!isValidEmail('no@domain'));
    assert.ok(!isValidEmail('@nodomain.com'));
    assert.ok(!isValidEmail('spaces in@email.com'));
  });
});

describe('Fallback Brief Generation', () => {
  function generateFallbackBrief(date: string, language: BriefLanguage, newsCount: number): DailyBrief {
    const isEnglish = language === 'en';

    return {
      id: `brief_fallback_${date}`,
      date,
      language,
      highlights: [],
      numbers: {},
      trends: [],
      watchList: [],
      content: isEnglish
        ? `# 📰 IrishTech Daily Brief - ${date}\n\n**Note:** Only ${newsCount} news articles today.`
        : `# 📰 爱尔兰科技日报 - ${date}\n\n**提示：** 今日仅有 ${newsCount} 条新闻。`,
      newsCount,
      generatedAt: new Date().toISOString(),
    };
  }

  it('should generate English fallback brief', () => {
    const brief = generateFallbackBrief('2026-03-24', 'en', 3);

    assert.equal(brief.language, 'en');
    assert.equal(brief.newsCount, 3);
    assert.ok(brief.content.includes('IrishTech Daily Brief'));
    assert.ok(brief.content.includes('3 news articles'));
    assert.equal(brief.highlights.length, 0);
  });

  it('should generate Chinese fallback brief', () => {
    const brief = generateFallbackBrief('2026-03-24', 'zh', 2);

    assert.equal(brief.language, 'zh');
    assert.equal(brief.newsCount, 2);
    assert.ok(brief.content.includes('爱尔兰科技日报'));
    assert.ok(brief.content.includes('2 条新闻'));
  });
});
