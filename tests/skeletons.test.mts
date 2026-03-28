/**
 * Tests for enhanced skeleton components (FR #208)
 *
 * Verifies that skeleton factories produce valid HTML with correct structure
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = join(import.meta.dirname, '..', 'src', 'components', 'skeletons');

describe('FR #208: Enhanced skeleton screens', () => {
  describe('Directory structure', () => {
    it('has skeletons directory', () => {
      assert.ok(existsSync(srcDir));
    });

    it('has index.ts re-exports', () => {
      assert.ok(existsSync(join(srcDir, 'index.ts')));
    });
  });

  describe('Skeleton modules exist', () => {
    it('has NewsPanelSkeleton.ts', () => {
      assert.ok(existsSync(join(srcDir, 'NewsPanelSkeleton.ts')));
    });

    it('has MarketPanelSkeleton.ts', () => {
      assert.ok(existsSync(join(srcDir, 'MarketPanelSkeleton.ts')));
    });

    it('has InsightsPanelSkeleton.ts', () => {
      assert.ok(existsSync(join(srcDir, 'InsightsPanelSkeleton.ts')));
    });

    it('has ChartSkeleton.ts', () => {
      assert.ok(existsSync(join(srcDir, 'ChartSkeleton.ts')));
    });
  });

  describe('NewsPanelSkeleton', () => {
    it('exports NewsPanelSkeleton function', () => {
      const content = readFileSync(join(srcDir, 'NewsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('export function NewsPanelSkeleton'));
    });

    it('exports renderNewsPanelSkeleton function', () => {
      const content = readFileSync(join(srcDir, 'NewsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('export function renderNewsPanelSkeleton'));
    });

    it('has skeleton-news-item class', () => {
      const content = readFileSync(join(srcDir, 'NewsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-news-item'));
    });

    it('has skeleton-headline class', () => {
      const content = readFileSync(join(srcDir, 'NewsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-headline'));
    });

    it('has aria-label for accessibility', () => {
      const content = readFileSync(join(srcDir, 'NewsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('aria-label'));
    });
  });

  describe('MarketPanelSkeleton', () => {
    it('exports MarketPanelSkeleton function', () => {
      const content = readFileSync(join(srcDir, 'MarketPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('export function MarketPanelSkeleton'));
    });

    it('has skeleton-ticker class', () => {
      const content = readFileSync(join(srcDir, 'MarketPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-ticker'));
    });

    it('has skeleton-price class', () => {
      const content = readFileSync(join(srcDir, 'MarketPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-price'));
    });

    it('has skeleton-sparkline class', () => {
      const content = readFileSync(join(srcDir, 'MarketPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-sparkline'));
    });

    it('supports showChart option', () => {
      const content = readFileSync(join(srcDir, 'MarketPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('showChart'));
    });
  });

  describe('InsightsPanelSkeleton', () => {
    it('exports InsightsPanelSkeleton function', () => {
      const content = readFileSync(join(srcDir, 'InsightsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('export function InsightsPanelSkeleton'));
    });

    it('has skeleton-insight-item class', () => {
      const content = readFileSync(join(srcDir, 'InsightsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-insight-item'));
    });

    it('has skeleton-metrics class', () => {
      const content = readFileSync(join(srcDir, 'InsightsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-metrics'));
    });

    it('supports showMetrics option', () => {
      const content = readFileSync(join(srcDir, 'InsightsPanelSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('showMetrics'));
    });
  });

  describe('ChartSkeleton', () => {
    it('exports ChartSkeleton function', () => {
      const content = readFileSync(join(srcDir, 'ChartSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('export function ChartSkeleton'));
    });

    it('has skeleton-chart-area class', () => {
      const content = readFileSync(join(srcDir, 'ChartSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-chart-area'));
    });

    it('has skeleton-chart-y-axis class', () => {
      const content = readFileSync(join(srcDir, 'ChartSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('skeleton-chart-y-axis'));
    });

    it('supports height option', () => {
      const content = readFileSync(join(srcDir, 'ChartSkeleton.ts'), 'utf-8');
      assert.ok(content.includes('height'));
    });

    it('supports variant option', () => {
      const content = readFileSync(join(srcDir, 'ChartSkeleton.ts'), 'utf-8');
      assert.ok(content.includes("variant"));
    });
  });

  describe('index.ts re-exports', () => {
    it('re-exports NewsPanelSkeleton', () => {
      const content = readFileSync(join(srcDir, 'index.ts'), 'utf-8');
      assert.ok(content.includes('NewsPanelSkeleton'));
    });

    it('re-exports MarketPanelSkeleton', () => {
      const content = readFileSync(join(srcDir, 'index.ts'), 'utf-8');
      assert.ok(content.includes('MarketPanelSkeleton'));
    });

    it('re-exports InsightsPanelSkeleton', () => {
      const content = readFileSync(join(srcDir, 'index.ts'), 'utf-8');
      assert.ok(content.includes('InsightsPanelSkeleton'));
    });

    it('re-exports ChartSkeleton', () => {
      const content = readFileSync(join(srcDir, 'index.ts'), 'utf-8');
      assert.ok(content.includes('ChartSkeleton'));
    });
  });

  describe('CSS styles', () => {
    const cssPath = join(import.meta.dirname, '..', 'src', 'styles', 'skeleton.css');

    it('has skeleton-news-item styles', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('.skeleton-news-item'));
    });

    it('has skeleton-market-item styles', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('.skeleton-market-item'));
    });

    it('has skeleton-insight-item styles', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('.skeleton-insight-item'));
    });

    it('has skeleton-chart styles', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('.skeleton-chart'));
    });

    it('has light theme overrides for FR #208', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('[data-theme="light"] .skeleton-headline'));
    });

    it('has shimmer animation for headlines', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('.skeleton-headline'));
      assert.ok(content.includes('skeleton-shimmer'));
    });
  });
});
