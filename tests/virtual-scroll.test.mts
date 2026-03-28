/**
 * Tests for virtual scroll utility (FR #209)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createVirtualScroller,
  throttleScroll,
  getVirtualContainerStyles,
} from '../src/utils/virtual-scroll.js';

describe('FR #209: Virtual scrolling', () => {
  describe('createVirtualScroller', () => {
    const config = {
      itemHeight: 80,
      containerHeight: 400,
      overscan: 5,
    };

    it('returns scroller with expected methods', () => {
      const scroller = createVirtualScroller(config);
      assert.strictEqual(typeof scroller.getVisibleRange, 'function');
      assert.strictEqual(typeof scroller.getVisibleItems, 'function');
      assert.strictEqual(typeof scroller.getTotalHeight, 'function');
      assert.strictEqual(typeof scroller.getIndexAtOffset, 'function');
      assert.strictEqual(typeof scroller.getOffsetForIndex, 'function');
    });

    it('stores config correctly', () => {
      const scroller = createVirtualScroller(config);
      assert.strictEqual(scroller.config.itemHeight, 80);
      assert.strictEqual(scroller.config.containerHeight, 400);
      assert.strictEqual(scroller.config.overscan, 5);
    });

    it('defaults overscan to 5 when not provided', () => {
      const scroller = createVirtualScroller({
        itemHeight: 80,
        containerHeight: 400,
      });
      assert.strictEqual(scroller.config.overscan, 5);
    });
  });

  describe('getVisibleRange', () => {
    const scroller = createVirtualScroller({
      itemHeight: 80,
      containerHeight: 400,
      overscan: 5,
    });

    it('returns empty range for empty list', () => {
      const range = scroller.getVisibleRange(0, 0);
      assert.strictEqual(range.startIndex, 0);
      assert.strictEqual(range.endIndex, 0);
      assert.strictEqual(range.totalHeight, 0);
    });

    it('calculates correct range at scroll top 0', () => {
      // containerHeight=400, itemHeight=80 → 5 visible items
      // with overscan=5: start=0, end=min(total, 5+5)=10
      const range = scroller.getVisibleRange(100, 0);
      assert.strictEqual(range.startIndex, 0);
      assert.strictEqual(range.endIndex, 10); // 5 visible + 5 overscan
      assert.strictEqual(range.offsetTop, 0);
    });

    it('calculates correct range when scrolled', () => {
      // scrollTop=800 → first visible item at index 10
      // with overscan=5: start=max(0, 10-5)=5
      // visible end at ceil((800+400)/80)=15, with overscan=20
      const range = scroller.getVisibleRange(100, 800);
      assert.strictEqual(range.startIndex, 5);
      assert.strictEqual(range.endIndex, 20);
      assert.strictEqual(range.offsetTop, 5 * 80); // 400
    });

    it('clamps endIndex to totalItems', () => {
      const range = scroller.getVisibleRange(10, 0);
      assert.strictEqual(range.endIndex, 10);
    });

    it('calculates total height correctly', () => {
      const range = scroller.getVisibleRange(100, 0);
      assert.strictEqual(range.totalHeight, 100 * 80); // 8000
    });

    it('calculates offsetBottom correctly', () => {
      const range = scroller.getVisibleRange(100, 0);
      // endIndex=10, totalItems=100 → offsetBottom = (100-10)*80 = 7200
      assert.strictEqual(range.offsetBottom, (100 - 10) * 80);
    });
  });

  describe('getVisibleItems', () => {
    const scroller = createVirtualScroller({
      itemHeight: 80,
      containerHeight: 400,
      overscan: 2,
    });

    it('returns empty array for empty list', () => {
      const items = scroller.getVisibleItems([], 0);
      assert.strictEqual(items.length, 0);
    });

    it('returns items with correct structure', () => {
      const data = ['a', 'b', 'c', 'd', 'e'];
      const items = scroller.getVisibleItems(data, 0);

      assert.ok(items.length > 0);
      assert.strictEqual(items[0].data, 'a');
      assert.strictEqual(items[0].index, 0);
      assert.strictEqual(items[0].offset, 0);
      assert.strictEqual(items[0].height, 80);
    });

    it('calculates offset correctly for each item', () => {
      const data = Array.from({ length: 20 }, (_, i) => `item-${i}`);
      const items = scroller.getVisibleItems(data, 0);

      for (const item of items) {
        assert.strictEqual(item.offset, item.index * 80);
      }
    });

    it('includes overscan items', () => {
      // overscan=2, visible=5 → should render 7 items at scroll 0
      const data = Array.from({ length: 20 }, (_, i) => `item-${i}`);
      const items = scroller.getVisibleItems(data, 0);

      // startIndex=0, endIndex = min(20, ceil(400/80)+2) = min(20, 7) = 7
      assert.strictEqual(items.length, 7);
    });
  });

  describe('getTotalHeight', () => {
    const scroller = createVirtualScroller({
      itemHeight: 80,
      containerHeight: 400,
    });

    it('returns 0 for 0 items', () => {
      assert.strictEqual(scroller.getTotalHeight(0), 0);
    });

    it('calculates height correctly', () => {
      assert.strictEqual(scroller.getTotalHeight(100), 8000);
      assert.strictEqual(scroller.getTotalHeight(1), 80);
    });
  });

  describe('getIndexAtOffset', () => {
    const scroller = createVirtualScroller({
      itemHeight: 80,
      containerHeight: 400,
    });

    it('returns 0 for offset 0', () => {
      assert.strictEqual(scroller.getIndexAtOffset(0), 0);
    });

    it('calculates index correctly', () => {
      assert.strictEqual(scroller.getIndexAtOffset(80), 1);
      assert.strictEqual(scroller.getIndexAtOffset(160), 2);
      assert.strictEqual(scroller.getIndexAtOffset(79), 0);
      assert.strictEqual(scroller.getIndexAtOffset(81), 1);
    });
  });

  describe('getOffsetForIndex', () => {
    const scroller = createVirtualScroller({
      itemHeight: 80,
      containerHeight: 400,
    });

    it('returns 0 for index 0', () => {
      assert.strictEqual(scroller.getOffsetForIndex(0), 0);
    });

    it('calculates offset correctly', () => {
      assert.strictEqual(scroller.getOffsetForIndex(1), 80);
      assert.strictEqual(scroller.getOffsetForIndex(10), 800);
    });
  });

  describe('throttleScroll', () => {
    it('returns a function', () => {
      const throttled = throttleScroll(() => {});
      assert.strictEqual(typeof throttled, 'function');
    });

    it('accepts custom delay parameter', () => {
      const throttled = throttleScroll(() => {}, 32);
      assert.strictEqual(typeof throttled, 'function');
    });
  });

  describe('getVirtualContainerStyles', () => {
    it('returns container and content style strings', () => {
      const styles = getVirtualContainerStyles(1000, 200);
      assert.ok(styles.containerStyle.includes('height: 1000px'));
      assert.ok(styles.contentStyle.includes('translateY(200px)'));
    });

    it('handles zero values', () => {
      const styles = getVirtualContainerStyles(0, 0);
      assert.ok(styles.containerStyle.includes('height: 0px'));
      assert.ok(styles.contentStyle.includes('translateY(0px)'));
    });
  });
});
