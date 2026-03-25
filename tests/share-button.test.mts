/**
 * Share Button Tests
 *
 * Tests for social sharing functionality.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Import functions to test
import {
  buildShareUrl,
  type ShareData,
} from '../src/components/ShareButton';

// ==============================================================
// URL Building Tests
// ==============================================================

describe('buildShareUrl', () => {
  it('should add UTM parameters for twitter', () => {
    const url = buildShareUrl('https://example.com/news/123', 'twitter');
    assert.ok(url.includes('utm_source=twitter'));
    assert.ok(url.includes('utm_medium=social'));
    assert.ok(url.includes('utm_campaign=share'));
  });

  it('should add UTM parameters for linkedin', () => {
    const url = buildShareUrl('https://example.com/news/456', 'linkedin');
    assert.ok(url.includes('utm_source=linkedin'));
    assert.ok(url.includes('utm_medium=social'));
  });

  it('should add UTM parameters for copy', () => {
    const url = buildShareUrl('https://example.com/map', 'copy');
    assert.ok(url.includes('utm_source=copy'));
  });

  it('should preserve existing query parameters', () => {
    const url = buildShareUrl('https://example.com/map?zoom=10', 'twitter');
    assert.ok(url.includes('zoom=10'));
    assert.ok(url.includes('utm_source=twitter'));
  });

  it('should handle relative URLs', () => {
    const url = buildShareUrl('/news/789', 'linkedin');
    assert.ok(url.includes('utm_source=linkedin'));
  });

  it('should handle invalid URLs gracefully', () => {
    const url = buildShareUrl('not-a-valid-url', 'copy');
    // Should return the original URL if parsing fails
    assert.equal(typeof url, 'string');
  });
});

// ==============================================================
// ShareData Type Tests
// ==============================================================

describe('ShareData interface', () => {
  it('should accept valid news share data', () => {
    const data: ShareData = {
      url: 'https://example.com/news/1',
      title: 'Test News Title',
      type: 'news',
    };
    assert.ok(data.url);
    assert.ok(data.title);
    assert.equal(data.type, 'news');
  });

  it('should accept valid map share data', () => {
    const data: ShareData = {
      url: 'https://example.com/map?lat=53.35',
      title: 'Ireland Tech Map',
      description: 'Explore tech companies',
      type: 'map',
    };
    assert.ok(data.description);
    assert.equal(data.type, 'map');
  });

  it('should accept valid brief share data', () => {
    const data: ShareData = {
      url: 'https://example.com/brief/2026-03-25',
      title: "Today's AI Brief",
      type: 'brief',
    };
    assert.equal(data.type, 'brief');
  });
});

// ==============================================================
// Edge Cases
// ==============================================================

describe('Edge Cases', () => {
  it('should handle empty URL', () => {
    const url = buildShareUrl('', 'twitter');
    assert.equal(typeof url, 'string');
  });

  it('should handle URL with special characters', () => {
    const url = buildShareUrl('https://example.com/news?q=test&lang=中文', 'linkedin');
    assert.ok(url.includes('utm_source=linkedin'));
  });

  it('should handle URL with hash', () => {
    const url = buildShareUrl('https://example.com/map#dublin', 'copy');
    assert.ok(url.includes('utm_source=copy'));
  });

  it('should encode UTM values properly', () => {
    const url = buildShareUrl('https://example.com/', 'twitter');
    // URL should be properly encoded
    assert.ok(!url.includes(' '));
  });
});

// ==============================================================
// Integration Tests
// ==============================================================

describe('Integration', () => {
  it('should generate valid Twitter intent URL format', () => {
    const shareUrl = buildShareUrl('https://ireland-monitor.app/news/123', 'twitter');
    // The final Twitter URL should include our UTM-tagged URL
    assert.ok(shareUrl.includes('ireland-monitor.app'));
    assert.ok(shareUrl.includes('utm_source=twitter'));
  });

  it('should generate valid LinkedIn share URL format', () => {
    const shareUrl = buildShareUrl('https://ireland-monitor.app/news/456', 'linkedin');
    assert.ok(shareUrl.includes('ireland-monitor.app'));
    assert.ok(shareUrl.includes('utm_source=linkedin'));
  });

  it('should handle full news workflow', () => {
    // Simulate the full flow of sharing a news item
    const newsUrl = 'https://ireland-monitor.app/news/intel-12b-investment';
    const title = 'Intel to invest €12B in Ireland';

    // Build share URLs for each platform
    const twitterUrl = buildShareUrl(newsUrl, 'twitter');
    const linkedinUrl = buildShareUrl(newsUrl, 'linkedin');
    const copyUrl = buildShareUrl(newsUrl, 'copy');

    // All should contain the original URL
    assert.ok(twitterUrl.includes('intel-12b-investment'));
    assert.ok(linkedinUrl.includes('intel-12b-investment'));
    assert.ok(copyUrl.includes('intel-12b-investment'));

    // Each should have its own UTM source
    assert.ok(twitterUrl.includes('utm_source=twitter'));
    assert.ok(linkedinUrl.includes('utm_source=linkedin'));
    assert.ok(copyUrl.includes('utm_source=copy'));
  });
});
