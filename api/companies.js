/**
 * Companies API
 *
 * Company profile data for Irish tech ecosystem.
 * Uses static data with Redis caching for news.
 *
 * Routes:
 * - GET /api/companies - List/search companies
 * - GET /api/companies/:slug - Get company by slug
 * - GET /api/companies/:slug/news - Get company news
 */

import { jsonResponse } from './_json-response.js';
import { withCors } from './_cors.js';

// Static company data (imported inline for Edge Function compatibility)
const IRELAND_COMPANIES = [
  {
    id: 'stripe',
    slug: 'stripe',
    name: 'Stripe',
    description: 'Financial infrastructure platform for the internet.',
    founded: 2010,
    headquarters: 'Dublin, Ireland',
    industry: 'Fintech',
    employeeCount: '5001-10000',
    website: 'https://stripe.com',
    funding: { total: '€2.5B', lastRound: 'Series H', lastRoundDate: '2021-03' },
    people: [
      { name: 'Patrick Collison', title: 'CEO' },
      { name: 'John Collison', title: 'President' },
    ],
    tags: ['unicorn', 'irish-founded', 'tech-hq'],
    coordinates: [-6.2603, 53.3498],
  },
  {
    id: 'intercom',
    slug: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform.',
    founded: 2011,
    headquarters: 'Dublin, Ireland',
    industry: 'SaaS',
    employeeCount: '501-1000',
    website: 'https://intercom.com',
    funding: { total: '€240M', lastRound: 'Series D' },
    tags: ['unicorn', 'irish-founded'],
    coordinates: [-6.2489, 53.3389],
  },
  {
    id: 'intel-ireland',
    slug: 'intel-ireland',
    name: 'Intel Ireland',
    description: 'Intel\'s largest manufacturing site outside the US.',
    founded: 1989,
    headquarters: 'Leixlip, Co. Kildare',
    industry: 'Semiconductor',
    employeeCount: '5001-10000',
    website: 'https://intel.ie',
    tags: ['semiconductor', 'multinational'],
    coordinates: [-6.4967, 53.3631],
  },
  {
    id: 'google-ireland',
    slug: 'google-ireland',
    name: 'Google Ireland',
    description: 'Google\'s EMEA headquarters.',
    founded: 2003,
    headquarters: 'Dublin, Ireland',
    industry: 'Cloud',
    employeeCount: '5001-10000',
    website: 'https://google.ie',
    tags: ['tech-hq', 'multinational'],
    coordinates: [-6.2376, 53.3392],
  },
  {
    id: 'meta-ireland',
    slug: 'meta-ireland',
    name: 'Meta Ireland',
    description: 'Meta\'s EMEA headquarters.',
    founded: 2008,
    headquarters: 'Dublin, Ireland',
    industry: 'Consumer',
    employeeCount: '5001-10000',
    website: 'https://meta.com',
    tags: ['tech-hq', 'multinational', 'data-center'],
    coordinates: [-6.2297, 53.3400],
  },
  {
    id: 'apple-ireland',
    slug: 'apple-ireland',
    name: 'Apple Ireland',
    description: 'Apple\'s European operations hub.',
    founded: 1980,
    headquarters: 'Cork, Ireland',
    industry: 'Consumer',
    employeeCount: '5001-10000',
    website: 'https://apple.com/ie',
    tags: ['tech-hq', 'multinational'],
    coordinates: [-8.4958, 51.8985],
  },
  {
    id: 'microsoft-ireland',
    slug: 'microsoft-ireland',
    name: 'Microsoft Ireland',
    description: 'Microsoft\'s EMEA operations center.',
    founded: 1985,
    headquarters: 'Dublin, Ireland',
    industry: 'Cloud',
    employeeCount: '1001-5000',
    website: 'https://microsoft.com/ie',
    tags: ['tech-hq', 'multinational', 'data-center'],
    coordinates: [-6.2220, 53.2860],
  },
  {
    id: 'amazon-ireland',
    slug: 'amazon-ireland',
    name: 'Amazon Ireland',
    description: 'Amazon\'s European operations including AWS.',
    founded: 2004,
    headquarters: 'Dublin, Ireland',
    industry: 'Cloud',
    employeeCount: '5001-10000',
    website: 'https://amazon.ie',
    tags: ['tech-hq', 'multinational', 'data-center'],
    coordinates: [-6.2389, 53.3331],
  },
  {
    id: 'analog-devices',
    slug: 'analog-devices',
    name: 'Analog Devices',
    description: 'Global semiconductor company.',
    founded: 1976,
    headquarters: 'Limerick, Ireland',
    industry: 'Semiconductor',
    employeeCount: '1001-5000',
    website: 'https://analog.com',
    tags: ['semiconductor', 'multinational'],
    coordinates: [-8.6305, 52.6638],
  },
  {
    id: 'fenergo',
    slug: 'fenergo',
    name: 'Fenergo',
    description: 'Client lifecycle management software.',
    founded: 2009,
    headquarters: 'Dublin, Ireland',
    industry: 'Fintech',
    employeeCount: '501-1000',
    website: 'https://fenergo.com',
    funding: { total: '€80M', lastRound: 'Growth' },
    tags: ['irish-founded', 'startup'],
    coordinates: [-6.2654, 53.3448],
  },
];

// Redis helpers
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

// Handler
async function handler(request) {
  const reqUrl = new URL(request.url);
  const method = request.method;
  const pathParts = reqUrl.pathname.split('/').filter(Boolean);

  // Only GET requests
  if (method !== 'GET') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // GET /api/companies/:slug/news
    if (pathParts.length >= 3 && pathParts[2] === 'news') {
      const slug = pathParts[1];
      const company = IRELAND_COMPANIES.find((c) => c.slug === slug);

      if (!company) {
        return jsonResponse({ success: false, error: 'Company not found' }, { status: 404 });
      }

      // Try to get cached news
      const cached = await redisGet(`companies:news:${slug}`);
      const news = cached || [];
      const limit = parseInt(reqUrl.searchParams.get('limit') || '20', 10);

      return jsonResponse({
        success: true,
        news: news.slice(0, limit),
        total: news.length,
      });
    }

    // GET /api/companies/:slug
    if (pathParts.length >= 2 && pathParts[1] !== '') {
      const slug = pathParts[1];
      const company = IRELAND_COMPANIES.find((c) => c.slug === slug);

      if (!company) {
        return jsonResponse({ success: false, error: 'Company not found' }, { status: 404 });
      }

      return jsonResponse({ success: true, company });
    }

    // GET /api/companies - List/search
    const filters = {
      q: reqUrl.searchParams.get('q') || undefined,
      industry: reqUrl.searchParams.get('industry') || undefined,
      tag: reqUrl.searchParams.get('tag') || undefined,
      location: reqUrl.searchParams.get('location') || undefined,
      offset: parseInt(reqUrl.searchParams.get('offset') || '0', 10),
      limit: parseInt(reqUrl.searchParams.get('limit') || '20', 10),
    };

    let companies = [...IRELAND_COMPANIES];

    // Apply filters
    if (filters.q) {
      const q = filters.q.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.industry.toLowerCase().includes(q)
      );
    }

    if (filters.industry) {
      companies = companies.filter((c) => c.industry === filters.industry);
    }

    if (filters.tag) {
      companies = companies.filter((c) => c.tags && c.tags.includes(filters.tag));
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      companies = companies.filter((c) =>
        c.headquarters.toLowerCase().includes(loc)
      );
    }

    const total = companies.length;

    // Pagination
    companies = companies.slice(filters.offset, filters.offset + filters.limit);

    return jsonResponse({ success: true, companies, total, filters });
  } catch (e) {
    console.error('[companies API] Error:', e);
    return jsonResponse({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export default withCors(handler);

export const config = {
  runtime: 'edge',
};
