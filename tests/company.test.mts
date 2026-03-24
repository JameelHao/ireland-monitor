/**
 * Company Service Tests
 *
 * Tests for company types, static data, and storage.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  Company,
  CompanyFunding,
  CompanyPerson,
  RelatedCompany,
  CompanyFilters,
  CompanyIndustry,
  CompanyTag,
} from '../src/types/company.js';
import { COMPANY_LIMITS } from '../src/types/company.js';
import {
  IRELAND_COMPANIES,
  getCompanyBySlug,
  getCompanyById,
  searchCompanies,
  getCompaniesByTag,
  getCompaniesByIndustry,
  getAllCompanySlugs,
} from '../src/data/ireland-companies.js';

describe('Company Types', () => {
  it('Company should have required fields', () => {
    const company: Company = {
      id: 'test-company',
      slug: 'test-company',
      name: 'Test Company',
      headquarters: 'Dublin, Ireland',
      industry: 'Fintech',
    };

    assert.equal(company.id, 'test-company');
    assert.equal(company.slug, 'test-company');
    assert.equal(company.name, 'Test Company');
    assert.equal(company.headquarters, 'Dublin, Ireland');
    assert.equal(company.industry, 'Fintech');
  });

  it('Company should support optional fields', () => {
    const company: Company = {
      id: 'full-company',
      slug: 'full-company',
      name: 'Full Company',
      headquarters: 'Cork, Ireland',
      industry: 'SaaS',
      description: 'A test company',
      founded: 2020,
      employeeCount: '51-200',
      website: 'https://example.com',
      funding: {
        total: '€10M',
        lastRound: 'Series A',
      },
      tags: ['startup', 'irish-founded'],
    };

    assert.equal(company.description, 'A test company');
    assert.equal(company.founded, 2020);
    assert.equal(company.funding?.total, '€10M');
    assert.deepEqual(company.tags, ['startup', 'irish-founded']);
  });

  it('CompanyFunding should have required and optional fields', () => {
    const funding: CompanyFunding = {
      total: '€100M',
      lastRound: 'Series B',
      lastRoundDate: '2025-06',
      investors: ['Sequoia', 'a16z'],
    };

    assert.equal(funding.total, '€100M');
    assert.equal(funding.lastRound, 'Series B');
    assert.deepEqual(funding.investors, ['Sequoia', 'a16z']);
  });

  it('CompanyPerson should have required fields', () => {
    const person: CompanyPerson = {
      name: 'John Doe',
      title: 'CEO',
      linkedin: 'https://linkedin.com/in/johndoe',
    };

    assert.equal(person.name, 'John Doe');
    assert.equal(person.title, 'CEO');
  });

  it('RelatedCompany should have correct structure', () => {
    const related: RelatedCompany = {
      slug: 'parent-company',
      name: 'Parent Company',
      relation: 'parent',
    };

    assert.equal(related.slug, 'parent-company');
    assert.equal(related.relation, 'parent');
  });
});

describe('Company Constants', () => {
  it('COMPANY_LIMITS should have correct values', () => {
    assert.equal(COMPANY_LIMITS.MAX_SEARCH_RESULTS, 50);
    assert.equal(COMPANY_LIMITS.DEFAULT_PAGE_SIZE, 20);
    assert.equal(COMPANY_LIMITS.MAX_NEWS_ITEMS, 50);
    assert.equal(COMPANY_LIMITS.CACHE_TTL_SECONDS, 3600);
  });
});

describe('Static Company Data', () => {
  it('IRELAND_COMPANIES should not be empty', () => {
    assert.ok(IRELAND_COMPANIES.length > 0);
  });

  it('All companies should have required fields', () => {
    for (const company of IRELAND_COMPANIES) {
      assert.ok(company.id, `Company missing id: ${JSON.stringify(company)}`);
      assert.ok(company.slug, `Company missing slug: ${company.id}`);
      assert.ok(company.name, `Company missing name: ${company.id}`);
      assert.ok(company.headquarters, `Company missing headquarters: ${company.id}`);
      assert.ok(company.industry, `Company missing industry: ${company.id}`);
    }
  });

  it('All slugs should be unique', () => {
    const slugs = IRELAND_COMPANIES.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(slugs.length, uniqueSlugs.size);
  });

  it('All IDs should be unique', () => {
    const ids = IRELAND_COMPANIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    assert.equal(ids.length, uniqueIds.size);
  });

  it('Coordinates should be valid if present', () => {
    for (const company of IRELAND_COMPANIES) {
      if (company.coordinates) {
        const [lng, lat] = company.coordinates;
        // Ireland is roughly between -10 to -5 longitude, 51 to 55 latitude
        assert.ok(lng >= -11 && lng <= -5, `Invalid longitude for ${company.slug}: ${lng}`);
        assert.ok(lat >= 51 && lat <= 56, `Invalid latitude for ${company.slug}: ${lat}`);
      }
    }
  });
});

describe('Company Lookup Functions', () => {
  it('getCompanyBySlug should find existing company', () => {
    const company = getCompanyBySlug('stripe');
    assert.ok(company);
    assert.equal(company.name, 'Stripe');
  });

  it('getCompanyBySlug should return undefined for non-existent', () => {
    const company = getCompanyBySlug('non-existent-company');
    assert.equal(company, undefined);
  });

  it('getCompanyById should find existing company', () => {
    const company = getCompanyById('stripe');
    assert.ok(company);
    assert.equal(company.slug, 'stripe');
  });

  it('getCompanyById should return undefined for non-existent', () => {
    const company = getCompanyById('non-existent');
    assert.equal(company, undefined);
  });

  it('getAllCompanySlugs should return all slugs', () => {
    const slugs = getAllCompanySlugs();
    assert.equal(slugs.length, IRELAND_COMPANIES.length);
    assert.ok(slugs.includes('stripe'));
  });
});

describe('Company Search Functions', () => {
  it('searchCompanies should find by name', () => {
    const results = searchCompanies('stripe');
    assert.ok(results.length >= 1);
    assert.ok(results.some((c) => c.slug === 'stripe'));
  });

  it('searchCompanies should be case-insensitive', () => {
    const results = searchCompanies('STRIPE');
    assert.ok(results.length >= 1);
    assert.ok(results.some((c) => c.slug === 'stripe'));
  });

  it('searchCompanies should find by industry', () => {
    const results = searchCompanies('fintech');
    assert.ok(results.length >= 1);
    for (const company of results) {
      assert.ok(
        company.industry.toLowerCase().includes('fintech') ||
          company.description?.toLowerCase().includes('fintech')
      );
    }
  });

  it('searchCompanies should return empty for no matches', () => {
    const results = searchCompanies('xyznonexistent123');
    assert.equal(results.length, 0);
  });

  it('getCompaniesByTag should filter correctly', () => {
    const unicorns = getCompaniesByTag('unicorn');
    assert.ok(unicorns.length >= 1);
    for (const company of unicorns) {
      assert.ok(company.tags?.includes('unicorn'));
    }
  });

  it('getCompaniesByIndustry should filter correctly', () => {
    const semiconductor = getCompaniesByIndustry('Semiconductor');
    assert.ok(semiconductor.length >= 1);
    for (const company of semiconductor) {
      assert.equal(company.industry, 'Semiconductor');
    }
  });
});

describe('Company Filters', () => {
  function applyFilters(companies: Company[], filters: CompanyFilters): Company[] {
    let result = [...companies];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q)
      );
    }

    if (filters.industry) {
      result = result.filter((c) => c.industry === filters.industry);
    }

    if (filters.tag) {
      result = result.filter((c) => c.tags?.includes(filters.tag as CompanyTag));
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter((c) => c.headquarters.toLowerCase().includes(loc));
    }

    return result;
  }

  it('should filter by industry', () => {
    const result = applyFilters(IRELAND_COMPANIES, { industry: 'Fintech' });
    assert.ok(result.length >= 1);
    for (const c of result) {
      assert.equal(c.industry, 'Fintech');
    }
  });

  it('should filter by tag', () => {
    const result = applyFilters(IRELAND_COMPANIES, { tag: 'tech-hq' });
    assert.ok(result.length >= 1);
    for (const c of result) {
      assert.ok(c.tags?.includes('tech-hq'));
    }
  });

  it('should filter by location', () => {
    const result = applyFilters(IRELAND_COMPANIES, { location: 'Dublin' });
    assert.ok(result.length >= 1);
    for (const c of result) {
      assert.ok(c.headquarters.toLowerCase().includes('dublin'));
    }
  });

  it('should combine multiple filters', () => {
    const result = applyFilters(IRELAND_COMPANIES, {
      location: 'Dublin',
      industry: 'Cloud',
    });
    for (const c of result) {
      assert.ok(c.headquarters.toLowerCase().includes('dublin'));
      assert.equal(c.industry, 'Cloud');
    }
  });
});

describe('Company Industry Validation', () => {
  const validIndustries: CompanyIndustry[] = [
    'Fintech', 'AI/ML', 'SaaS', 'E-commerce', 'Healthcare',
    'Gaming', 'Semiconductor', 'Data Center', 'Cybersecurity',
    'Cloud', 'Enterprise', 'Consumer', 'Other',
  ];

  it('all companies should have valid industry', () => {
    for (const company of IRELAND_COMPANIES) {
      assert.ok(
        validIndustries.includes(company.industry),
        `Invalid industry "${company.industry}" for ${company.slug}`
      );
    }
  });
});

describe('Company Tag Validation', () => {
  const validTags: CompanyTag[] = [
    'unicorn', 'tech-hq', 'data-center', 'semiconductor',
    'startup', 'multinational', 'irish-founded',
  ];

  it('all company tags should be valid', () => {
    for (const company of IRELAND_COMPANIES) {
      if (company.tags) {
        for (const tag of company.tags) {
          assert.ok(
            validTags.includes(tag),
            `Invalid tag "${tag}" for ${company.slug}`
          );
        }
      }
    }
  });
});

describe('Known Companies Spot Check', () => {
  it('Stripe should exist with correct data', () => {
    const stripe = getCompanyBySlug('stripe');
    assert.ok(stripe);
    assert.equal(stripe.name, 'Stripe');
    assert.equal(stripe.industry, 'Fintech');
    assert.ok(stripe.tags?.includes('unicorn'));
    assert.ok(stripe.tags?.includes('irish-founded'));
    assert.ok(stripe.funding?.total);
    assert.ok(stripe.people && stripe.people.length > 0);
  });

  it('Intel Ireland should exist with correct data', () => {
    const intel = getCompanyBySlug('intel-ireland');
    assert.ok(intel);
    assert.equal(intel.industry, 'Semiconductor');
    assert.ok(intel.tags?.includes('semiconductor'));
  });

  it('Google Ireland should exist with correct data', () => {
    const google = getCompanyBySlug('google-ireland');
    assert.ok(google);
    assert.ok(google.tags?.includes('tech-hq'));
    assert.ok(google.headquarters.includes('Dublin'));
  });
});
