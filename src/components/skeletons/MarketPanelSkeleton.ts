/**
 * Market Panel Skeleton
 * FR #208: Enhanced skeleton screens per panel type
 *
 * Renders a loading placeholder matching the MarketPanel layout:
 * - Ticker symbol (small square)
 * - Price with change indicator
 * - Mini sparkline chart
 */

export interface MarketPanelSkeletonProps {
  /** Number of market item placeholders to show (default: 6) */
  rows?: number;
  /** Show sparkline chart placeholder (default: true) */
  showChart?: boolean;
}

/**
 * Creates HTML for market panel skeleton loading state
 *
 * @param props - Configuration options
 * @returns HTML string for the skeleton
 */
export function MarketPanelSkeleton(props: MarketPanelSkeletonProps = {}): string {
  const { rows = 6, showChart = true } = props;

  const items = Array.from({ length: rows }, () => `
    <div class="skeleton-card skeleton-market-item" aria-hidden="true">
      <div class="skeleton-market-left">
        <div class="skeleton-ticker"></div>
        <div class="skeleton-symbol"></div>
      </div>
      <div class="skeleton-market-right">
        <div class="skeleton-price"></div>
        <div class="skeleton-change"></div>
      </div>
      ${showChart ? '<div class="skeleton-sparkline"></div>' : ''}
    </div>
  `).join('');

  return `
    <div class="skeleton-panel skeleton-market" role="status" aria-label="Loading market data...">
      ${items}
    </div>
  `;
}

/**
 * Renders market skeleton directly into a container element
 *
 * @param container - DOM element to render into
 * @param props - Configuration options
 */
export function renderMarketPanelSkeleton(
  container: HTMLElement,
  props: MarketPanelSkeletonProps = {}
): void {
  container.innerHTML = MarketPanelSkeleton(props);
}
