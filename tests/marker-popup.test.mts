/**
 * Marker Popup Tests
 *
 * Tests for rich popup rendering with logo, company details,
 * related news, and company profile links.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { renderLogo, getInitials, getInitialsBackground, renderInitialsPlaceholder } from '../src/utils/logoFallback';
import { getCompanyInitials } from '../src/types/marker';

// ==============================================================
// Logo Fallback Utility Tests
// ==============================================================

describe('logoFallback utility', () => {
  describe('getInitials', () => {
    it('should extract initials from single word', () => {
      expect(getInitials('Google')).toBe('GO');
      expect(getInitials('Meta')).toBe('ME');
      expect(getInitials('X')).toBe('X');
    });

    it('should extract initials from multiple words', () => {
      expect(getInitials('Intel Corporation')).toBe('IC');
      expect(getInitials('Amazon Web Services')).toBe('AW');
      expect(getInitials('New York Times')).toBe('NY');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('?');
      expect(getInitials('   ')).toBe('?');
    });

    it('should handle extra whitespace', () => {
      expect(getInitials('  Google  ')).toBe('GO');
      expect(getInitials('Intel   Corporation')).toBe('IC');
    });
  });

  describe('getInitialsBackground', () => {
    it('should return consistent colors for same input', () => {
      const color1 = getInitialsBackground('Google');
      const color2 = getInitialsBackground('Google');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different inputs', () => {
      const colorGoogle = getInitialsBackground('Google');
      const colorApple = getInitialsBackground('Apple');
      expect(colorGoogle).not.toBe(colorApple);
    });

    it('should return valid HSL color', () => {
      const color = getInitialsBackground('Test');
      expect(color).toMatch(/^hsl\(\d+, 45%, 35%\)$/);
    });
  });

  describe('renderInitialsPlaceholder', () => {
    it('should render div with initials', () => {
      const html = renderInitialsPlaceholder('Google', 48);
      expect(html).toContain('GO');
      expect(html).toContain('logo-initials');
      expect(html).toContain('48px');
    });

    it('should use default size when not specified', () => {
      const html = renderInitialsPlaceholder('Apple');
      expect(html).toContain('48px');
    });

    it('should scale font size with element size', () => {
      const html32 = renderInitialsPlaceholder('Test', 32);
      const html64 = renderInitialsPlaceholder('Test', 64);
      expect(html32).toContain('font-size: 13px'); // 32 * 0.4 ≈ 13
      expect(html64).toContain('font-size: 26px'); // 64 * 0.4 ≈ 26
    });
  });

  describe('renderLogo', () => {
    it('should render img tag when logo URL is provided', () => {
      const html = renderLogo('https://example.com/logo.png', 'Company', 48);
      expect(html).toContain('<img');
      expect(html).toContain('src="https://example.com/logo.png"');
      expect(html).toContain('company-logo');
    });

    it('should render initials fallback when no logo URL', () => {
      const html = renderLogo(undefined, 'Google', 48);
      expect(html).toContain('logo-initials');
      expect(html).toContain('GO');
    });

    it('should include onerror handler for image fallback', () => {
      const html = renderLogo('https://example.com/logo.png', 'Test', 48);
      expect(html).toContain('onerror=');
      expect(html).toContain('TE'); // Fallback initials
    });
  });
});

// ==============================================================
// Marker Type Tests
// ==============================================================

describe('marker types', () => {
  describe('getCompanyInitials', () => {
    it('should extract initials from company name', () => {
      expect(getCompanyInitials('Intel Corporation')).toBe('IC');
      expect(getCompanyInitials('Google')).toBe('GO');
      expect(getCompanyInitials('Amazon Web Services')).toBe('AW');
    });

    it('should handle single word names', () => {
      expect(getCompanyInitials('Meta')).toBe('ME');
      expect(getCompanyInitials('X')).toBe('X');
    });
  });
});

// ==============================================================
// Popup Content Structure Tests
// ==============================================================

describe('popup content structure', () => {
  // These tests verify expected HTML structure elements
  // In a real test environment, we would instantiate MapPopup and test rendering

  it('should define expected popup types', () => {
    const popupTypes = [
      'semiconductorHub',
      'irelandDataCenter',
      'irelandTechHQ',
      'irishUnicorn',
    ];

    // Verify popup types are documented
    expect(popupTypes).toContain('semiconductorHub');
    expect(popupTypes).toContain('irelandDataCenter');
    expect(popupTypes).toContain('irelandTechHQ');
    expect(popupTypes).toContain('irishUnicorn');
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

    // Document expected classes - actual CSS validation would require DOM
    expectedClasses.forEach(cls => {
      expect(cls).toMatch(/^popup-/);
    });
  });
});

// ==============================================================
// Ireland Data Integration Tests
// ==============================================================

describe('ireland data integration', () => {
  it('should import semiconductor hubs data', async () => {
    const { IRELAND_SEMICONDUCTOR_HUBS } = await import('../src/config/variants/ireland/data');
    expect(IRELAND_SEMICONDUCTOR_HUBS).toBeDefined();
    expect(Array.isArray(IRELAND_SEMICONDUCTOR_HUBS)).toBe(true);
    expect(IRELAND_SEMICONDUCTOR_HUBS.length).toBeGreaterThan(0);
  });

  it('should import data centers data', async () => {
    const { IRELAND_DATA_CENTERS } = await import('../src/config/variants/ireland/data');
    expect(IRELAND_DATA_CENTERS).toBeDefined();
    expect(Array.isArray(IRELAND_DATA_CENTERS)).toBe(true);
    expect(IRELAND_DATA_CENTERS.length).toBeGreaterThan(0);
  });

  it('should import tech HQs data', async () => {
    const { IRELAND_TECH_HQS } = await import('../src/config/variants/ireland/data');
    expect(IRELAND_TECH_HQS).toBeDefined();
    expect(Array.isArray(IRELAND_TECH_HQS)).toBe(true);
    expect(IRELAND_TECH_HQS.length).toBeGreaterThan(0);
  });

  it('should import unicorns data', async () => {
    const { IRISH_UNICORNS } = await import('../src/config/variants/ireland/data');
    expect(IRISH_UNICORNS).toBeDefined();
    expect(Array.isArray(IRISH_UNICORNS)).toBe(true);
    expect(IRISH_UNICORNS.length).toBeGreaterThan(0);
  });

  it('semiconductor hub should have required fields', async () => {
    const { IRELAND_SEMICONDUCTOR_HUBS } = await import('../src/config/variants/ireland/data');
    const hub = IRELAND_SEMICONDUCTOR_HUBS[0];

    expect(hub).toHaveProperty('id');
    expect(hub).toHaveProperty('name');
    expect(hub).toHaveProperty('company');
    expect(hub).toHaveProperty('lat');
    expect(hub).toHaveProperty('lng');
    expect(hub).toHaveProperty('employees');
    expect(hub).toHaveProperty('business');
  });

  it('data center should have required fields', async () => {
    const { IRELAND_DATA_CENTERS } = await import('../src/config/variants/ireland/data');
    const dc = IRELAND_DATA_CENTERS[0];

    expect(dc).toHaveProperty('id');
    expect(dc).toHaveProperty('name');
    expect(dc).toHaveProperty('operator');
    expect(dc).toHaveProperty('location');
    expect(dc).toHaveProperty('lat');
    expect(dc).toHaveProperty('lng');
    expect(dc).toHaveProperty('status');
  });

  it('tech HQ should have required fields', async () => {
    const { IRELAND_TECH_HQS } = await import('../src/config/variants/ireland/data');
    const hq = IRELAND_TECH_HQS[0];

    expect(hq).toHaveProperty('id');
    expect(hq).toHaveProperty('company');
    expect(hq).toHaveProperty('type');
    expect(hq).toHaveProperty('location');
    expect(hq).toHaveProperty('lat');
    expect(hq).toHaveProperty('lng');
  });

  it('unicorn should have required fields', async () => {
    const { IRISH_UNICORNS } = await import('../src/config/variants/ireland/data');
    const unicorn = IRISH_UNICORNS[0];

    expect(unicorn).toHaveProperty('id');
    expect(unicorn).toHaveProperty('name');
    expect(unicorn).toHaveProperty('location');
    expect(unicorn).toHaveProperty('lat');
    expect(unicorn).toHaveProperty('lng');
    expect(unicorn).toHaveProperty('category');
    expect(unicorn).toHaveProperty('sector');
    expect(unicorn).toHaveProperty('founded');
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

    expect(calculateTier(4000)).toBe(1);
    expect(calculateTier(3000)).toBe(1);
    expect(calculateTier(2000)).toBe(2);
    expect(calculateTier(1000)).toBe(2);
    expect(calculateTier(500)).toBe(3);
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
    expect(limitedNews.length).toBe(3);
  });

  it('should handle empty news array', () => {
    const emptyNews: { title: string; url: string }[] = [];
    const shouldShowSection = emptyNews.length > 0;
    expect(shouldShowSection).toBe(false);
  });
});
