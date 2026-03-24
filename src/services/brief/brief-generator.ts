/**
 * Brief Generator Service
 *
 * Generates AI-powered daily briefs using GPT-4.
 * Fetches news, builds prompts, and parses structured output.
 */

import type {
  DailyBrief,
  BriefHighlight,
  BriefNumbers,
  BriefTrend,
  BriefWatchItem,
  BriefLanguage,
} from '@/types/brief';
import { BRIEF_LIMITS, BRIEF_PROMPT_TEMPLATE } from '@/types/brief';

/**
 * News article structure (from existing news system)
 */
interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  publishedAt?: string;
}

/**
 * OpenAI API response structure
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
}

/**
 * Parsed brief from GPT response
 */
interface ParsedBrief {
  highlights: BriefHighlight[];
  numbers: BriefNumbers;
  trends: BriefTrend[];
  watchList: BriefWatchItem[];
  content: string;
}

/**
 * Generate unique brief ID
 */
function generateBriefId(): string {
  return `brief_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Format news articles for prompt
 */
function formatNewsForPrompt(news: NewsArticle[]): string {
  return news
    .map((n, i) => {
      const summary = n.summary ? `\n   Summary: ${n.summary}` : '';
      const source = n.source ? ` (${n.source})` : '';
      return `${i + 1}. ${n.title}${source}${summary}`;
    })
    .join('\n\n');
}

/**
 * Build the GPT prompt
 */
function buildPrompt(news: NewsArticle[], language: BriefLanguage): string {
  const newsContent = formatNewsForPrompt(news);
  const languageInstruction =
    language === 'zh'
      ? 'Respond entirely in Simplified Chinese (简体中文). Use Chinese numbers and formatting.'
      : 'Respond in English.';

  return BRIEF_PROMPT_TEMPLATE.replace('{newsCount}', String(news.length))
    .replace('{newsContent}', newsContent)
    .replace('{languageInstruction}', languageInstruction);
}

/**
 * Parse GPT response to structured brief
 */
function parseGPTResponse(content: string): ParsedBrief {
  // Try to extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in GPT response');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.slice(0, BRIEF_LIMITS.MAX_HIGHLIGHTS)
        : [],
      numbers: parsed.numbers || {},
      trends: Array.isArray(parsed.trends)
        ? parsed.trends.slice(0, BRIEF_LIMITS.MAX_TRENDS)
        : [],
      watchList: Array.isArray(parsed.watchList)
        ? parsed.watchList.slice(0, BRIEF_LIMITS.MAX_WATCH_ITEMS)
        : [],
      content: parsed.content || '',
    };
  } catch (e) {
    throw new Error(`Failed to parse GPT response: ${e}`);
  }
}

/**
 * Generate fallback brief when news is insufficient
 */
function generateFallbackBrief(date: string, language: BriefLanguage, newsCount: number): DailyBrief {
  const isEnglish = language === 'en';

  return {
    id: generateBriefId(),
    date,
    language,
    highlights: [],
    numbers: {},
    trends: [],
    watchList: [],
    content: isEnglish
      ? `# 📰 IrishTech Daily Brief - ${date}\n\n**Note:** Only ${newsCount} news articles today. Full brief will resume when more news is available.\n\nCheck back tomorrow for the complete analysis!`
      : `# 📰 爱尔兰科技日报 - ${date}\n\n**提示：** 今日仅有 ${newsCount} 条新闻。完整简报将在新闻充足时恢复。\n\n请明日再来查看完整分析！`,
    newsCount,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Brief Generator class
 */
export class BriefGenerator {
  private openaiApiKey: string | undefined;
  private openaiModel: string;

  constructor() {
    this.openaiApiKey =
      typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined;
    this.openaiModel = 'gpt-4-turbo';
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<OpenAIResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: [
          {
            role: 'system',
            content: "You are an expert analyst of Ireland's tech ecosystem.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: BRIEF_LIMITS.MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generate daily brief from news articles
   */
  async generate(
    news: NewsArticle[],
    date: string,
    language: BriefLanguage
  ): Promise<DailyBrief> {
    // Check minimum news count
    if (news.length < BRIEF_LIMITS.MIN_NEWS_COUNT) {
      return generateFallbackBrief(date, language, news.length);
    }

    // Build prompt
    const prompt = buildPrompt(news, language);

    // Call GPT-4
    const response = await this.callOpenAI(prompt);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse response
    const parsed = parseGPTResponse(content);

    // Build final brief
    const brief: DailyBrief = {
      id: generateBriefId(),
      date,
      language,
      highlights: parsed.highlights,
      numbers: parsed.numbers,
      trends: parsed.trends,
      watchList: parsed.watchList,
      content: parsed.content,
      newsCount: news.length,
      tokenUsage: response.usage?.total_tokens,
      generatedAt: new Date().toISOString(),
    };

    return brief;
  }

  /**
   * Generate brief with mock data (for testing without OpenAI)
   */
  generateMock(date: string, language: BriefLanguage): DailyBrief {
    const isEnglish = language === 'en';

    return {
      id: generateBriefId(),
      date,
      language,
      highlights: [
        {
          title: isEnglish ? 'Intel announces €5B expansion' : 'Intel 宣布 50 亿欧元扩张',
          takeaway: isEnglish
            ? '3,000 new jobs by 2027'
            : '2027 年前创造 3000 个新岗位',
          company: 'Intel',
        },
        {
          title: isEnglish
            ? 'Stripe acquires Dublin AI startup'
            : 'Stripe 收购都柏林 AI 初创公司',
          takeaway: isEnglish
            ? 'Largest Irish tech M&A this quarter'
            : '本季度最大爱尔兰科技并购',
          company: 'Stripe',
        },
      ],
      numbers: {
        totalFunding: '€450M',
        maDeals: 3,
        newJobs: 4500,
        topSector: 'AI/ML',
      },
      trends: [
        {
          description: isEnglish
            ? 'AI adoption accelerating in fintech'
            : 'AI 在金融科技领域加速普及',
          evidence: ['Stripe AI acquisition', 'Revolut ML team expansion'],
        },
      ],
      watchList: [
        {
          name: 'Web Summit Dublin',
          date: '2026-03-26',
          description: isEnglish
            ? 'Europe\'s largest tech conference'
            : '欧洲最大科技会议',
        },
      ],
      content: isEnglish
        ? `# 📰 IrishTech Daily Brief - ${date}\n\n## 🔥 Today's Highlights\n\n1. **Intel announces €5B expansion**\n   → 3,000 new jobs by 2027\n\n2. **Stripe acquires Dublin AI startup**\n   → Largest Irish tech M&A this quarter\n\n## 📊 By the Numbers\n\n- 💰 Total funding: €450M\n- 🏢 M&A deals: 3\n- 👥 New jobs: 4,500+\n- 📈 Top sector: AI/ML\n\n---\n*Generated by IrishTech Daily AI*`
        : `# 📰 爱尔兰科技日报 - ${date}\n\n## 🔥 今日要闻\n\n1. **Intel 宣布 50 亿欧元扩张**\n   → 2027 年前创造 3000 个新岗位\n\n2. **Stripe 收购都柏林 AI 初创公司**\n   → 本季度最大爱尔兰科技并购\n\n## 📊 数据一览\n\n- 💰 融资总额：4.5 亿欧元\n- 🏢 并购交易：3 笔\n- 👥 新增岗位：4,500+\n- 📈 热门领域：AI/ML\n\n---\n*由 IrishTech Daily AI 生成*`,
      newsCount: 25,
      tokenUsage: 0,
      generatedAt: new Date().toISOString(),
    };
  }
}

// Export singleton
export const briefGenerator = new BriefGenerator();
