import { getBriefCache, setBriefCache } from './_brief-cache.js';
import { buildFallbackBrief } from './_brief-fallback.js';
import { getNewsByRegion } from './_brief-news.js';
import { summarizeDailyBrief } from './_brief-summarizer.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300',
    },
  });
}

function parseDate(raw) {
  const date = raw || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, date };
  }
  const value = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(value.getTime())) return { ok: false, date };
  return { ok: true, date };
}

export async function createBriefResponse(request, deps = {}) {
  const url = new URL(request.url);
  const parsedDate = parseDate(url.searchParams.get('date') || '');
  if (!parsedDate.ok) {
    return json({ error: 'INVALID_DATE', message: 'date must be YYYY-MM-DD', date: parsedDate.date }, 400);
  }

  const limit = Number(url.searchParams.get('limit') || '20');
  const normalizedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 20;

  const cacheKey = `brief:${parsedDate.date}:ireland:${normalizedLimit}`;
  const cached = getBriefCache(cacheKey);
  if (cached) {
    return json({ ...cached, cached: true });
  }

  const news = await getNewsByRegion({
    region: 'Ireland',
    category: ['ieTech', 'ieAcademic', 'ieSummits', 'ieBusiness', 'ieDeals', 'ieJobs'],
    date: parsedDate.date,
    limit: normalizedLimit,
  }, deps);

  let summary = '';
  let provider = 'fallback';
  let model = 'rules';
  let degraded = false;

  if (news.length > 0) {
    try {
      const result = await summarizeDailyBrief(news, deps);
      summary = result.summary;
      provider = result.provider;
      model = result.model;
    } catch {
      degraded = true;
      summary = buildFallbackBrief(news, parsedDate.date);
    }
  } else {
    degraded = true;
    summary = buildFallbackBrief(news, parsedDate.date);
  }

  const payload = {
    date: parsedDate.date,
    summary,
    sourceCount: news.length,
    provider,
    model,
    cached: false,
    degraded,
    generatedAt: new Date().toISOString(),
  };

  setBriefCache(cacheKey, payload);
  return json(payload);
}

export default async function handler(request) {
  return createBriefResponse(request);
}
