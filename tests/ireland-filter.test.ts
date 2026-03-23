import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isInIreland,
  containsIrelandKeywords,
  isIrelandSource,
  isIrelandRelated,
  sortByIrelandRelevance,
} from '../src/config/variants/ireland/utils/filters.js';

describe('ireland-filter', () => {
  describe('isInIreland', () => {
    it('returns true for Dublin coordinates', () => {
      assert.strictEqual(isInIreland(53.35, -6.26), true);
    });

    it('returns true for Cork coordinates', () => {
      assert.strictEqual(isInIreland(51.90, -8.47), true);
    });

    it('returns false for London coordinates', () => {
      assert.strictEqual(isInIreland(51.5, -0.1), false);
    });

    it('returns false for null coordinates', () => {
      assert.strictEqual(isInIreland(undefined, undefined), false);
    });
  });

  describe('containsIrelandKeywords', () => {
    it('returns true for title with "Dublin"', () => {
      assert.strictEqual(containsIrelandKeywords('Tech startup in Dublin raises $5M'), true);
    });

    it('returns true for content with "Irish"', () => {
      assert.strictEqual(containsIrelandKeywords('News', 'An Irish company announced'), true);
    });

    it('returns true for "TCD" (Trinity College Dublin)', () => {
      assert.strictEqual(containsIrelandKeywords('TCD researchers discover'), true);
    });

    it('returns false for unrelated content', () => {
      assert.strictEqual(containsIrelandKeywords('New York startup launches app'), false);
    });
  });

  describe('isIrelandSource', () => {
    it('returns true for Silicon Republic', () => {
      assert.strictEqual(isIrelandSource('Silicon Republic'), true);
    });

    it('returns true for Irish Times', () => {
      assert.strictEqual(isIrelandSource('Irish Times'), true);
    });

    it('returns false for TechCrunch', () => {
      assert.strictEqual(isIrelandSource('TechCrunch'), false);
    });
  });

  describe('isIrelandRelated', () => {
    it('returns true for item in Ireland', () => {
      assert.strictEqual(isIrelandRelated({ lat: 53.35, lng: -6.26 }), true);
    });

    it('returns true for item with country Ireland', () => {
      assert.strictEqual(isIrelandRelated({ country: 'Ireland' }), true);
    });

    it('returns true for item with Irish keyword', () => {
      assert.strictEqual(isIrelandRelated({ title: 'Dublin startup news' }), true);
    });

    it('returns true for item from Irish source', () => {
      assert.strictEqual(isIrelandRelated({ source: 'Silicon Republic' }), true);
    });

    it('returns false for unrelated item', () => {
      assert.strictEqual(isIrelandRelated({ lat: 40.7, lng: -74.0, title: 'NYC news' }), false);
    });
  });

  describe('sortByIrelandRelevance', () => {
    it('sorts Ireland items first', () => {
      const items = [
        { id: 1, lat: 40.7, lng: -74.0 },  // NYC
        { id: 2, lat: 53.35, lng: -6.26 }, // Dublin
        { id: 3, title: 'Irish news' },
      ];
      const sorted = sortByIrelandRelevance(items);
      assert.strictEqual(sorted[0].id, 2);
      assert.strictEqual(sorted[1].id, 3);
      assert.strictEqual(sorted[2].id, 1);
    });
  });
});
