import { XMLParser } from 'fast-xml-parser';

const GOOGLE_NEWS_RSS = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IE&gl=IE&ceid=IE:en`;

export const IRELAND_BRIEF_FEEDS = {
  ieTech: [
    { name: 'Irish Tech', url: GOOGLE_NEWS_RSS('(Ireland OR Irish OR Dublin) (technology OR startup OR AI) when:2d') },
  ],
  ieAcademic: [
    { name: 'Irish Academic', url: GOOGLE_NEWS_RSS('(Ireland OR Irish university) (AI OR research OR lab) when:7d') },
  ],
  ieSummits: [
    { name: 'Irish Summits', url: GOOGLE_NEWS_RSS('(Ireland OR Dublin OR Cork) (tech summit OR conference OR meetup) when:14d') },
  ],
  ieBusiness: [
    { name: 'Irish Business', url: GOOGLE_NEWS_RSS('(Ireland OR Irish) (tech business OR scaleup OR SaaS) when:7d') },
  ],
  ieDeals: [
    { name: 'Irish Tech Deals', url: GOOGLE_NEWS_RSS('(Ireland OR Irish OR Dublin) (tech OR startup) (acquisition OR merger OR takeover OR funding) when:30d') },
  ],
  ieJobs: [
    { name: 'Irish Big Tech Jobs', url: GOOGLE_NEWS_RSS('(Ireland OR Dublin OR Cork) (Google OR AWS OR Meta OR Microsoft OR OpenAI OR Anthropic OR xAI) (hiring OR jobs OR careers) when:7d') },
  ],
};

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

function normalizeItems(parsed) {
  const channel = parsed?.rss?.channel || parsed?.feed;
  if (!channel) return [];
  const rawItems = channel.item || channel.entry || [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  return items.map((item) => ({
    title: item?.title?.['#text'] || item?.title || '',
    link: item?.link?.['@_href'] || item?.link || '',
    source: item?.source?.['#text'] || item?.source || channel?.title || 'Unknown',
    summary: item?.description || item?.summary || '',
    pubDate: item?.pubDate || item?.published || item?.updated || '',
  })).filter((item) => item.title && item.link);
}

function toDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function dedupeByLink(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.link.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getNewsByRegion(options, deps = {}) {
  const {
    date,
    limit = 20,
    category = ['ieTech', 'ieAcademic', 'ieSummits', 'ieBusiness', 'ieDeals', 'ieJobs'],
  } = options || {};

  const fetchFn = deps.fetch || fetch;
  const categories = Array.isArray(category) ? category : [category];
  const feeds = categories.flatMap((c) => IRELAND_BRIEF_FEEDS[c] || []);

  const all = [];
  await Promise.all(feeds.map(async (feed) => {
    try {
      const res = await fetchFn(feed.url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' } });
      if (!res.ok) return;
      const xml = await res.text();
      const parsed = parser.parse(xml);
      const items = normalizeItems(parsed).map((item) => ({ ...item, source: feed.name }));
      all.push(...items);
    } catch {
      // 单个源失败不影响整体聚合
    }
  }));

  const filtered = all.filter((item) => toDateOnly(item.pubDate) === date);
  return dedupeByLink(filtered)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, Math.min(Math.max(Number(limit) || 20, 1), 50));
}
