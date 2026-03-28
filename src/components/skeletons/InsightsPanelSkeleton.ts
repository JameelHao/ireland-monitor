/**
 * Insights Panel Skeleton
 * FR #208: Enhanced skeleton screens per panel type
 *
 * Renders a loading placeholder matching the InsightsPanel layout:
 * - Title bar
 * - Summary text block
 * - Metric indicators
 */

export interface InsightsPanelSkeletonProps {
  /** Number of insight card placeholders to show (default: 3) */
  rows?: number;
  /** Show metric indicators (default: true) */
  showMetrics?: boolean;
}

/**
 * Creates HTML for insights panel skeleton loading state
 *
 * @param props - Configuration options
 * @returns HTML string for the skeleton
 */
export function InsightsPanelSkeleton(props: InsightsPanelSkeletonProps = {}): string {
  const { rows = 3, showMetrics = true } = props;

  const metrics = showMetrics ? `
    <div class="skeleton-metrics">
      <div class="skeleton-metric"></div>
      <div class="skeleton-metric"></div>
      <div class="skeleton-metric"></div>
    </div>
  ` : '';

  const items = Array.from({ length: rows }, () => `
    <div class="skeleton-card skeleton-insight-item" aria-hidden="true">
      <div class="skeleton-insight-header">
        <div class="skeleton-insight-icon"></div>
        <div class="skeleton-insight-title"></div>
      </div>
      <div class="skeleton-insight-summary"></div>
      <div class="skeleton-insight-summary short"></div>
    </div>
  `).join('');

  return `
    <div class="skeleton-panel skeleton-insights" role="status" aria-label="Loading insights...">
      ${metrics}
      ${items}
    </div>
  `;
}

/**
 * Renders insights skeleton directly into a container element
 *
 * @param container - DOM element to render into
 * @param props - Configuration options
 */
export function renderInsightsPanelSkeleton(
  container: HTMLElement,
  props: InsightsPanelSkeletonProps = {}
): void {
  container.innerHTML = InsightsPanelSkeleton(props);
}
