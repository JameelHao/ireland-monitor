/**
 * Virtual Scroll Utility
 * FR #209: Virtual scrolling for long news lists
 *
 * Renders only visible items + overscan buffer to reduce DOM nodes
 * and improve performance for long lists.
 */

/** Configuration for virtual scroller */
export interface VirtualScrollConfig {
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the scroll container in pixels */
  containerHeight: number;
  /** Number of extra items to render above/below visible area (default: 5) */
  overscan?: number;
}

/** Result of visible range calculation */
export interface VirtualRange {
  /** Index of first visible item */
  startIndex: number;
  /** Index of last visible item (exclusive) */
  endIndex: number;
  /** Offset for top spacer in pixels */
  offsetTop: number;
  /** Offset for bottom spacer in pixels */
  offsetBottom: number;
  /** Total content height in pixels */
  totalHeight: number;
}

/** Virtual item with positioning info */
export interface VirtualItem<T> {
  /** Original item data */
  data: T;
  /** Index in the full list */
  index: number;
  /** Y offset from top in pixels */
  offset: number;
  /** Item height in pixels */
  height: number;
}

/**
 * Creates a virtual scroller instance
 *
 * @param config - Virtual scroll configuration
 * @returns Virtual scroller methods
 *
 * @example
 * ```typescript
 * const scroller = createVirtualScroller({
 *   itemHeight: 80,
 *   containerHeight: 400,
 *   overscan: 5,
 * });
 *
 * const { startIndex, endIndex } = scroller.getVisibleRange(items.length, scrollTop);
 * const visibleItems = scroller.getVisibleItems(items, scrollTop);
 * ```
 */
export function createVirtualScroller(config: VirtualScrollConfig) {
  const { itemHeight, containerHeight, overscan = 5 } = config;

  /**
   * Calculate the visible range of items based on scroll position
   *
   * @param totalItems - Total number of items in the list
   * @param scrollTop - Current scroll position
   * @returns Range information for rendering
   */
  function getVisibleRange(totalItems: number, scrollTop: number): VirtualRange {
    if (totalItems === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        offsetTop: 0,
        offsetBottom: 0,
        totalHeight: 0,
      };
    }

    const totalHeight = totalItems * itemHeight;

    // Calculate visible range
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // Apply overscan buffer
    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(totalItems, visibleEnd + overscan);

    // Calculate spacer offsets
    const offsetTop = startIndex * itemHeight;
    const offsetBottom = (totalItems - endIndex) * itemHeight;

    return {
      startIndex,
      endIndex,
      offsetTop,
      offsetBottom,
      totalHeight,
    };
  }

  /**
   * Get visible items with positioning information
   *
   * @param items - Full list of items
   * @param scrollTop - Current scroll position
   * @returns Array of virtual items to render
   */
  function getVisibleItems<T>(items: T[], scrollTop: number): VirtualItem<T>[] {
    const { startIndex, endIndex } = getVisibleRange(items.length, scrollTop);

    const visibleItems: VirtualItem<T>[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      if (item !== undefined) {
        visibleItems.push({
          data: item,
          index: i,
          offset: i * itemHeight,
          height: itemHeight,
        });
      }
    }

    return visibleItems;
  }

  /**
   * Calculate total content height
   *
   * @param totalItems - Total number of items
   * @returns Total height in pixels
   */
  function getTotalHeight(totalItems: number): number {
    return totalItems * itemHeight;
  }

  /**
   * Get the item index at a given scroll position
   *
   * @param scrollTop - Scroll position
   * @returns Item index
   */
  function getIndexAtOffset(scrollTop: number): number {
    return Math.floor(scrollTop / itemHeight);
  }

  /**
   * Get scroll position for a given item index
   *
   * @param index - Item index
   * @returns Scroll position in pixels
   */
  function getOffsetForIndex(index: number): number {
    return index * itemHeight;
  }

  return {
    getVisibleRange,
    getVisibleItems,
    getTotalHeight,
    getIndexAtOffset,
    getOffsetForIndex,
    config: { itemHeight, containerHeight, overscan },
  };
}

/**
 * Type for the virtual scroller instance
 */
export type VirtualScroller = ReturnType<typeof createVirtualScroller>;

/**
 * Throttle scroll events for performance
 *
 * @param callback - Scroll handler function
 * @param delay - Throttle delay in ms (default: 16 for ~60fps)
 * @returns Throttled callback
 */
export function throttleScroll(
  callback: (scrollTop: number) => void,
  delay: number = 16
): (event: Event) => void {
  let lastCall = 0;
  let rafId: number | null = null;

  return (event: Event) => {
    const now = Date.now();
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    if (now - lastCall >= delay) {
      lastCall = now;
      callback(scrollTop);
    } else if (!rafId) {
      // Schedule a call for the next frame
      rafId = requestAnimationFrame(() => {
        rafId = null;
        lastCall = Date.now();
        callback(scrollTop);
      });
    }
  };
}

/**
 * Create CSS styles for virtual scroll container
 *
 * @param totalHeight - Total content height
 * @param offsetTop - Top spacer offset
 * @returns CSS style object
 */
export function getVirtualContainerStyles(
  totalHeight: number,
  offsetTop: number
): { containerStyle: string; contentStyle: string } {
  return {
    containerStyle: `height: ${totalHeight}px; position: relative;`,
    contentStyle: `transform: translateY(${offsetTop}px);`,
  };
}
