/**
 * News Classifier Tests
 *
 * Tests for news visual hierarchy classification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  NewsTier,
  extractFundingAmount,
  isMergerAcquisition,
  isBreakingNews,
  isTier1Company,
  getHoursAgo,
  classifyCluster,
  classifyNewsItem,
  shouldShowHotBadge,
  getTierClassName,
} from '../src/utils/newsClassifier';
import type { ClusteredEvent, NewsItem } from '../src/types';

// ==============================================================
// extractFundingAmount Tests
// ==============================================================

describe('extractFundingAmount', () => {
  it('should extract EUR funding in millions', () => {
    assert.equal(extractFundingAmount('Startup raises €40M in Series A'), 40_000_000);
    assert.equal(extractFundingAmount('Company secures €15 million funding'), 15_000_000);
    assert.equal(extractFundingAmount('Raised €5.5m for expansion'), 5_500_000);
  });

  it('should extract EUR funding in billions', () => {
    assert.equal(extractFundingAmount('Tech giant raises €1.5bn'), 1_500_000_000);
    assert.equal(extractFundingAmount('Secured €2 billion in Series D'), 2_000_000_000);
  });

  it('should extract USD funding and convert to EUR', () => {
    const amount = extractFundingAmount('Startup raises $100M in Series B');
    assert.ok(amount !== null);
    // $100M * 0.92 = €92M
    assert.ok(amount! >= 90_000_000 && amount! <= 95_000_000);
  });

  it('should return null for non-funding titles', () => {
    assert.equal(extractFundingAmount('Company launches new product'), null);
    assert.equal(extractFundingAmount('CEO steps down after 10 years'), null);
  });

  it('should handle various funding patterns', () => {
    assert.ok(extractFundingAmount('Secures €20M funding round')! >= 19_000_000);
    assert.ok(extractFundingAmount('€50 million investment announced')! >= 49_000_000);
    assert.ok(extractFundingAmount('Series A funding of €12M')! >= 11_000_000);
  });
});

// ==============================================================
// isMergerAcquisition Tests
// ==============================================================

describe('isMergerAcquisition', () => {
  it('should detect acquisition keywords', () => {
    assert.equal(isMergerAcquisition('Google acquires AI startup'), true);
    assert.equal(isMergerAcquisition('Company acquired by Microsoft'), true);
    assert.equal(isMergerAcquisition('Major acquisition announced'), true);
  });

  it('should detect merger keywords', () => {
    assert.equal(isMergerAcquisition('Two companies announce merger'), true);
    assert.equal(isMergerAcquisition('Merger deal completed'), true);
  });

  it('should detect takeover keywords', () => {
    assert.equal(isMergerAcquisition('Hostile takeover bid rejected'), true);
    assert.equal(isMergerAcquisition('Company takes over rival'), true);
  });

  it('should return false for non-M&A news', () => {
    assert.equal(isMergerAcquisition('Company launches new product'), false);
    assert.equal(isMergerAcquisition('Quarterly earnings beat expectations'), false);
  });
});

// ==============================================================
// isBreakingNews Tests
// ==============================================================

describe('isBreakingNews', () => {
  it('should detect breaking news', () => {
    assert.equal(isBreakingNews('BREAKING: Major announcement'), true);
    assert.equal(isBreakingNews('Just in: CEO resigns'), true);
    assert.equal(isBreakingNews('URGENT: System outage reported'), true);
  });

  it('should detect developing stories', () => {
    assert.equal(isBreakingNews('Developing: Investigation ongoing'), true);
  });

  it('should return false for regular news', () => {
    assert.equal(isBreakingNews('Company reports quarterly results'), false);
    assert.equal(isBreakingNews('New product launched'), false);
  });
});

// ==============================================================
// isTier1Company Tests
// ==============================================================

describe('isTier1Company', () => {
  it('should detect tier-1 tech companies', () => {
    assert.equal(isTier1Company('Google announces new AI model', 'TechCrunch'), true);
    assert.equal(isTier1Company('Meta reveals VR headset', 'The Verge'), true);
    assert.equal(isTier1Company('Apple iPhone sales surge', 'Reuters'), true);
    assert.equal(isTier1Company('Microsoft Azure outage', 'BBC'), true);
  });

  it('should detect from source name', () => {
    assert.equal(isTier1Company('Major announcement', 'Intel Ireland'), true);
    assert.equal(isTier1Company('News update', 'OpenAI Blog'), true);
  });

  it('should return false for non-tier-1 companies', () => {
    assert.equal(isTier1Company('Local startup raises funds', 'Tech Ireland'), false);
    assert.equal(isTier1Company('Small company news', 'Business Post'), false);
  });
});

// ==============================================================
// getHoursAgo Tests
// ==============================================================

describe('getHoursAgo', () => {
  it('should calculate hours for recent date', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hours = getHoursAgo(oneHourAgo);
    assert.ok(hours >= 0.9 && hours <= 1.1);
  });

  it('should calculate hours for older date', () => {
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const hours = getHoursAgo(threeDaysAgo);
    assert.ok(hours >= 71 && hours <= 73);
  });
});

// ==============================================================
// classifyCluster Tests
// ==============================================================

describe('classifyCluster', () => {
  const createMockCluster = (overrides: Partial<ClusteredEvent>): ClusteredEvent => ({
    id: 'test-cluster',
    primaryTitle: 'Test news title',
    primarySource: 'Test Source',
    primaryLink: 'https://example.com',
    sourceCount: 1,
    topSources: [],
    allItems: [],
    firstSeen: new Date(),
    lastUpdated: new Date(),
    isAlert: false,
    ...overrides,
  });

  it('should classify alert as tier 1', () => {
    const cluster = createMockCluster({ isAlert: true });
    assert.equal(classifyCluster(cluster), NewsTier.Important);
  });

  it('should classify breaking news as tier 1', () => {
    const cluster = createMockCluster({ primaryTitle: 'BREAKING: Major event' });
    assert.equal(classifyCluster(cluster), NewsTier.Important);
  });

  it('should classify major funding as tier 1', () => {
    const cluster = createMockCluster({ primaryTitle: 'Startup raises €50M in Series B' });
    assert.equal(classifyCluster(cluster), NewsTier.Important);
  });

  it('should classify M&A as tier 1', () => {
    const cluster = createMockCluster({ primaryTitle: 'Google acquires AI startup' });
    assert.equal(classifyCluster(cluster), NewsTier.Important);
  });

  it('should classify high threat level as tier 1', () => {
    const cluster = createMockCluster({
      threat: { level: 'critical', category: 'security', confidence: 0.9 },
    });
    assert.equal(classifyCluster(cluster), NewsTier.Important);
  });

  it('should classify spike velocity as tier 1', () => {
    const cluster = createMockCluster({
      velocity: {
        level: 'spike',
        trend: 'rising',
        sourcesPerHour: 10,
        sentiment: 'neutral',
        sentimentScore: 0,
      },
    });
    assert.equal(classifyCluster(cluster), NewsTier.Important);
  });

  it('should classify old news as tier 3', () => {
    const fourDaysAgo = new Date(Date.now() - 96 * 60 * 60 * 1000);
    const cluster = createMockCluster({
      primaryTitle: 'Regular news',
      lastUpdated: fourDaysAgo,
    });
    assert.equal(classifyCluster(cluster), NewsTier.Minor);
  });

  it('should classify regular news as tier 2', () => {
    const cluster = createMockCluster({
      primaryTitle: 'Company launches new product',
    });
    assert.equal(classifyCluster(cluster), NewsTier.Standard);
  });
});

// ==============================================================
// classifyNewsItem Tests
// ==============================================================

describe('classifyNewsItem', () => {
  const createMockItem = (overrides: Partial<NewsItem>): NewsItem => ({
    title: 'Test news title',
    source: 'Test Source',
    link: 'https://example.com',
    pubDate: new Date(),
    isAlert: false,
    ...overrides,
  });

  it('should classify alert item as tier 1', () => {
    const item = createMockItem({ isAlert: true });
    assert.equal(classifyNewsItem(item), NewsTier.Important);
  });

  it('should classify major funding item as tier 1', () => {
    const item = createMockItem({ title: 'Company raises €25M' });
    assert.equal(classifyNewsItem(item), NewsTier.Important);
  });

  it('should classify old item as tier 3', () => {
    const fourDaysAgo = new Date(Date.now() - 96 * 60 * 60 * 1000);
    const item = createMockItem({ pubDate: fourDaysAgo });
    assert.equal(classifyNewsItem(item), NewsTier.Minor);
  });

  it('should classify regular item as tier 2', () => {
    const item = createMockItem({ title: 'Regular news item' });
    assert.equal(classifyNewsItem(item), NewsTier.Standard);
  });
});

// ==============================================================
// shouldShowHotBadge Tests
// ==============================================================

describe('shouldShowHotBadge', () => {
  it('should return true for tier 1 + recent', () => {
    const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    assert.equal(shouldShowHotBadge(NewsTier.Important, recentDate), true);
  });

  it('should return false for tier 1 + old', () => {
    const oldDate = new Date(Date.now() - 30 * 60 * 60 * 1000); // 30 hours ago
    assert.equal(shouldShowHotBadge(NewsTier.Important, oldDate), false);
  });

  it('should return false for tier 2', () => {
    const recentDate = new Date();
    assert.equal(shouldShowHotBadge(NewsTier.Standard, recentDate), false);
  });

  it('should return false for tier 3', () => {
    const recentDate = new Date();
    assert.equal(shouldShowHotBadge(NewsTier.Minor, recentDate), false);
  });
});

// ==============================================================
// getTierClassName Tests
// ==============================================================

describe('getTierClassName', () => {
  it('should return correct class names', () => {
    assert.equal(getTierClassName(NewsTier.Important), 'tier-1');
    assert.equal(getTierClassName(NewsTier.Standard), 'tier-2');
    assert.equal(getTierClassName(NewsTier.Minor), 'tier-3');
  });
});

// ==============================================================
// Edge Cases
// ==============================================================

describe('Edge cases', () => {
  it('should handle empty title', () => {
    assert.equal(extractFundingAmount(''), null);
    assert.equal(isMergerAcquisition(''), false);
    assert.equal(isBreakingNews(''), false);
  });

  it('should handle case-insensitive matching', () => {
    assert.equal(isMergerAcquisition('COMPANY ACQUIRES STARTUP'), true);
    assert.equal(isBreakingNews('breaking news'), true);
    assert.equal(isTier1Company('GOOGLE launches', 'Source'), true);
  });

  it('should handle small funding amounts correctly', () => {
    // €5M should not be tier 1 (threshold is €10M)
    const amount = extractFundingAmount('Startup raises €5M');
    assert.ok(amount !== null && amount < 10_000_000);
  });
});
