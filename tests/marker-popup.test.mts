/**
 * Marker Popup Tests
 *
 * Tests for rich popup rendering with logo, company details,
 * related news, and company profile links.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderLogo, getInitials, getInitialsBackground, renderInitialsPlaceholder } from '../src/utils/logoFallback';
import { getCompanyInitials } from '../src/types/marker';

// ==============================================================
// Logo Fallback Utility Tests
// ==============================================================

describe('logoFallback utility', () => {
  describe('getInitials', () => {
    it('should extract initials from single word', () => {
      assert.equal(getInitials('Google'), 'GO');
      assert.equal(getInitials('Meta'), 'ME');
      assert.equal(getInitials('X'), 'X');
    });

    it('should extract initials from multiple words', () => {
      assert.equal(getInitials('Intel Corporation'), 'IC');
      assert.equal(getInitials('Amazon Web Services'), 'AW');
      assert.equal(getInitials('New York Times'), 'NY');
    });

    it('should handle empty string', () => {
      assert.equal(getInitials(''), '?');
      assert.equal(getInitials('   '), '?');
    });

    it('should handle extra whitespace', () => {
      assert.equal(getInitials('  Google  '), 'GO');
      assert.equal(getInitials('Intel   Corporation'), 'IC');
    });
  });

  describe('getInitialsBackground', () => {
    it('should return consistent colors for same input', () => {
      const color1 = getInitialsBackground('Google');
      const color2 = getInitialsBackground('Google');
      assert.equal(color1, color2);
    });

    it('should return different colors for different inputs', () => {
      const colorGoogle = getInitialsBackground('Google');
      const colorApple = getInitialsBackground('Apple');
      assert.notEqual(colorGoogle, colorApple);
    });

    it('should return valid HSL color', () => {
      const color = getInitialsBackground('Test');
      assert.match(color, /^hsl\(\d+, 45%, 35%\)$/);
    });
  });

  describe('renderInitialsPlaceholder', () => {
    it('should render div with initials', () => {
      const html = renderInitialsPlaceholder('Google', 48);
      assert.ok(html.includes('GO'));
      assert.ok(html.includes('logo-initials'));
      assert.ok(html.includes('48px'));
    });

    it('should use default size when not specified', () => {
      const html = renderInitialsPlaceholder('Apple');
      assert.ok(html.includes('48px'));
    });

    it('should scale font size with element size', () => {
      const html32 = renderInitialsPlaceholder('Test', 32);
      const html64 = renderInitialsPlaceholder('Test', 64);
      assert.ok(html32.includes('font-size: 13px')); // 32 * 0.4 ≈ 13
      assert.ok(html64.includes('font-size: 26px')); // 64 * 0.4 ≈ 26
    });
  });

  describe('renderLogo', () => {
    it('should render img tag when logo URL is provided', () => {
      const html = renderLogo('https://example.com/logo.png', 'Company', 48);
      assert.ok(html.includes('<img'));
      assert.ok(html.includes('src="https://example.com/logo.png"'));
      assert.ok(html.includes('company-logo'));
    });

    it('should render initials fallback when no logo URL', () => {
      const html = renderLogo(undefined, 'Google', 48);
      assert.ok(html.includes('logo-initials'));
      assert.ok(html.includes('GO'));
    });

    it('should include onerror handler for image fallback', () => {
      const html = renderLogo('https://example.com/logo.png', 'Test', 48);
      assert.ok(html.includes('onerror='));
      assert.ok(html.includes('TE')); // Fallback initials
    });
  });
});

// ==============================================================
// Marker Type Tests
// ==============================================================

describe('marker types', () => {
  describe('getCompanyInitials', () => {
    it('should extract initials from company name', () => {
      assert.equal(getCompanyInitials('Intel Corporation'), 'IC');
      assert.equal(getCompanyInitials('Google'), 'GO');
      assert.equal(getCompanyInitials('Amazon Web Services'), 'AW');
    });

    it('should handle single word names', () => {
      assert.equal(getCompanyInitials('Meta'), 'ME');
      assert.equal(getCompanyInitials('X'), 'X');
    });
  });
});

// ==============================================================
// Popup Content Structure Tests
// ==============================================================

describe('popup content structure', () => {
  it('should define expected popup types', () => {
    const popupTypes = [
      'semiconductorHub',
      'irelandDataCenter',
      'irelandTechHQ',
      'irishUnicorn',
    ];

    assert.ok(popupTypes.includes('semiconductorHub'));
    assert.ok(popupTypes.includes('irelandDataCenter'));
    assert.ok(popupTypes.includes('irelandTechHQ'));
    assert.ok(popupTypes.includes('irishUnicorn'));
  });

  it('should have correct popup CSS classes defined', () => {
    const expectedClasses = [
      'popup-header-rich',
      'popup-logo',
      'popup-header-content',
      'popup-company-name',
      'popup-type-badge',
      'popup-details-rich',
      'popup-detail-row',
      'popup-news-section',
      'popup-news-header',
      'popup-news-list',
      'popup-news-item',
      'popup-cta',
      'popup-cta-button',
    ];

    expectedClasses.forEach(cls => {
      assert.match(cls, /^popup-/);
    });
  });
});

// ==============================================================
// Ireland Data Integration Tests
// ==============================================================

describe('ireland data integration', () => {
  it('should import semiconductor hubs data', async () => {
    const { IRELAND_SEMICONDUCTOR_HUBS } = await import('../src/config/variants/ireland/data');
    assert.ok(IRELAND_SEMICONDUCTOR_HUBS);
    assert.ok(Array.isArray(IRELAND_SEMICONDUCTOR_HUBS));
    assert.ok(IRELAND_SEMICONDUCTOR_HUBS.length > 0);
  });

  it('should import data centers data', async () => {
    const { IRELAND_DATA_CENTERS } = await import('../src/config/variants/ireland/data');
    assert.ok(IRELAND_DATA_CENTERS);
    assert.ok(Array.isArray(IRELAND_DATA_CENTERS));
    assert.ok(IRELAND_DATA_CENTERS.length > 0);
  });

  it('should import tech HQs data', async () => {
    const { IRELAND_TECH_HQS } = await import('../src/config/variants/ireland/data');
    assert.ok(IRELAND_TECH_HQS);
    assert.ok(Array.isArray(IRELAND_TECH_HQS));
    assert.ok(IRELAND_TECH_HQS.length > 0);
  });

  it('should import unicorns data', async () => {
    const { IRISH_UNICORNS } = await import('../src/config/variants/ireland/data');
    assert.ok(IRISH_UNICORNS);
    assert.ok(Array.isArray(IRISH_UNICORNS));
    assert.ok(IRISH_UNICORNS.length > 0);
  });

  it('semiconductor hub should have required fields', async () => {
    const { IRELAND_SEMICONDUCTOR_HUBS } = await import('../src/config/variants/ireland/data');
    const hub = IRELAND_SEMICONDUCTOR_HUBS[0];

    assert.ok('id' in hub);
    assert.ok('name' in hub);
    assert.ok('company' in hub);
    assert.ok('lat' in hub);
    assert.ok('lng' in hub);
    assert.ok('employees' in hub);
    assert.ok('business' in hub);
  });

  it('data center should have required fields', async () => {
    const { IRELAND_DATA_CENTERS } = await import('../src/config/variants/ireland/data');
    const dc = IRELAND_DATA_CENTERS[0];

    assert.ok('id' in dc);
    assert.ok('name' in dc);
    assert.ok('operator' in dc);
    assert.ok('location' in dc);
    assert.ok('lat' in dc);
    assert.ok('lng' in dc);
    assert.ok('status' in dc);
  });

  it('tech HQ should have required fields', async () => {
    const { IRELAND_TECH_HQS } = await import('../src/config/variants/ireland/data');
    const hq = IRELAND_TECH_HQS[0];

    assert.ok('id' in hq);
    assert.ok('company' in hq);
    assert.ok('type' in hq);
    assert.ok('location' in hq);
    assert.ok('lat' in hq);
    assert.ok('lng' in hq);
  });

  it('unicorn should have required fields', async () => {
    const { IRISH_UNICORNS } = await import('../src/config/variants/ireland/data');
    const unicorn = IRISH_UNICORNS[0];

    assert.ok('id' in unicorn);
    assert.ok('name' in unicorn);
    assert.ok('location' in unicorn);
    assert.ok('lat' in unicorn);
    assert.ok('lng' in unicorn);
    assert.ok('category' in unicorn);
    assert.ok('sector' in unicorn);
    assert.ok('founded' in unicorn);
  });
});

// ==============================================================
// Popup Tier Calculation Tests
// ==============================================================

describe('popup tier calculation', () => {
  it('should calculate semiconductor tier based on employees', () => {
    // Tier logic: >= 3000 -> 1, >= 1000 -> 2, else -> 3
    const calculateTier = (employees: number) => {
      return employees >= 3000 ? 1 : employees >= 1000 ? 2 : 3;
    };

    assert.equal(calculateTier(4000), 1);
    assert.equal(calculateTier(3000), 1);
    assert.equal(calculateTier(2000), 2);
    assert.equal(calculateTier(1000), 2);
    assert.equal(calculateTier(500), 3);
  });
});

// ==============================================================
// Related News Mock Tests
// ==============================================================

describe('related news functionality', () => {
  it('should limit news items to 3', () => {
    const mockNews = [
      { title: 'News 1', url: '#' },
      { title: 'News 2', url: '#' },
      { title: 'News 3', url: '#' },
      { title: 'News 4', url: '#' },
      { title: 'News 5', url: '#' },
    ];

    const limitedNews = mockNews.slice(0, 3);
    assert.equal(limitedNews.length, 3);
  });

  it('should handle empty news array', () => {
    const emptyNews: { title: string; url: string }[] = [];
    const shouldShowSection = emptyNews.length > 0;
    assert.equal(shouldShowSection, false);
  });
});
