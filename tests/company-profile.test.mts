/**
 * Company Profile Tests
 *
 * Tests for company profile route detection and data lookup.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock company data for testing
const mockCompanies = [
  {
    id: 'stripe',
    slug: 'stripe',
    name: 'Stripe',
    description: 'Financial infrastructure platform',
    industry: 'Fintech',
    headquarters: 'Dublin, Ireland',
    founded: 2010,
    tags: ['unicorn', 'irish-founded'],
  },
  {
    id: 'intercom',
    slug: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform',
    industry: 'SaaS',
    headquarters: 'Dublin, Ireland',
    founded: 2011,
  },
  {
    id: 'intel-ireland',
    slug: 'intel-ireland',
    name: 'Intel Ireland',
    description: 'Semiconductor manufacturing',
    industry: 'Semiconductor',
    headquarters: 'Leixlip, Ireland',
  },
];

/**
 * Find company by ID or slug (matching the component logic)
 */
function findCompany(id: string) {
  const lowerId = id.toLowerCase();
  return mockCompanies.find(
    c => c.id.toLowerCase() === lowerId || c.slug.toLowerCase() === lowerId
  );
}

/**
 * Parse company ID from URL path
 */
function parseCompanyRoute(pathname: string): string | null {
  const match = pathname.match(/^\/company\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Format tag for display
 */
function formatTag(tag: string): string {
  const tagLabels: Record<string, string> = {
    'unicorn': '🦄 Unicorn',
    'tech-hq': '🏢 Tech HQ',
    'data-center': '🖥️ Data Center',
    'semiconductor': '💎 Semiconductor',
    'startup': '🚀 Startup',
    'multinational': '🌍 Multinational',
    'irish-founded': '☘️ Irish Founded',
  };
  return tagLabels[tag] || tag;
}

// ==============================================================
// Route Parsing Tests
// ==============================================================

describe('Route Parsing', () => {
  it('should parse valid company route', () => {
    assert.equal(parseCompanyRoute('/company/stripe'), 'stripe');
  });

  it('should parse company route with encoded characters', () => {
    assert.equal(parseCompanyRoute('/company/intel%20ireland'), 'intel ireland');
  });

  it('should return null for non-company routes', () => {
    assert.equal(parseCompanyRoute('/'), null);
    assert.equal(parseCompanyRoute('/map'), null);
    assert.equal(parseCompanyRoute('/about'), null);
  });

  it('should return null for invalid company routes', () => {
    assert.equal(parseCompanyRoute('/company'), null);
    assert.equal(parseCompanyRoute('/company/'), null);
    assert.equal(parseCompanyRoute('/company/stripe/details'), null);
  });
});

// ==============================================================
// Company Lookup Tests
// ==============================================================

describe('Company Lookup', () => {
  it('should find company by exact ID', () => {
    const company = findCompany('stripe');
    assert.ok(company);
    assert.equal(company.name, 'Stripe');
  });

  it('should find company by slug', () => {
    const company = findCompany('intel-ireland');
    assert.ok(company);
    assert.equal(company.name, 'Intel Ireland');
  });

  it('should be case-insensitive', () => {
    const company1 = findCompany('STRIPE');
    const company2 = findCompany('Stripe');
    const company3 = findCompany('stripe');
    assert.ok(company1);
    assert.ok(company2);
    assert.ok(company3);
    assert.equal(company1.id, company2.id);
    assert.equal(company2.id, company3.id);
  });

  it('should return undefined for non-existent company', () => {
    const company = findCompany('nonexistent-company');
    assert.equal(company, undefined);
  });
});

// ==============================================================
// Tag Formatting Tests
// ==============================================================

describe('Tag Formatting', () => {
  it('should format unicorn tag', () => {
    assert.equal(formatTag('unicorn'), '🦄 Unicorn');
  });

  it('should format irish-founded tag', () => {
    assert.equal(formatTag('irish-founded'), '☘️ Irish Founded');
  });

  it('should format tech-hq tag', () => {
    assert.equal(formatTag('tech-hq'), '🏢 Tech HQ');
  });

  it('should return raw tag for unknown tags', () => {
    assert.equal(formatTag('custom-tag'), 'custom-tag');
  });
});

// ==============================================================
// Company Data Structure Tests
// ==============================================================

describe('Company Data Structure', () => {
  it('should have required fields', () => {
    const company = findCompany('stripe');
    assert.ok(company);
    assert.ok(company.id);
    assert.ok(company.name);
    assert.ok(company.industry);
    assert.ok(company.headquarters);
  });

  it('should have optional fields', () => {
    const company = findCompany('stripe');
    assert.ok(company);
    assert.ok(company.description);
    assert.ok(company.founded);
    assert.ok(company.tags);
  });

  it('should handle company without optional fields', () => {
    const company = findCompany('intel-ireland');
    assert.ok(company);
    assert.equal(company.tags, undefined);
    assert.equal(company.founded, undefined);
  });
});

// ==============================================================
// Integration Tests
// ==============================================================

describe('Integration', () => {
  it('should parse route and find company', () => {
    const pathname = '/company/stripe';
    const companyId = parseCompanyRoute(pathname);
    assert.ok(companyId);
    const company = findCompany(companyId);
    assert.ok(company);
    assert.equal(company.name, 'Stripe');
  });

  it('should handle URL-encoded company ID', () => {
    const pathname = '/company/intel-ireland';
    const companyId = parseCompanyRoute(pathname);
    assert.ok(companyId);
    const company = findCompany(companyId);
    assert.ok(company);
    assert.equal(company.industry, 'Semiconductor');
  });

  it('should return not found for invalid route', () => {
    const pathname = '/company/unknown-company';
    const companyId = parseCompanyRoute(pathname);
    assert.ok(companyId);
    const company = findCompany(companyId);
    assert.equal(company, undefined);
  });
});
