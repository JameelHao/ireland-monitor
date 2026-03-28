/**
 * Chart Skeleton
 * FR #208: Enhanced skeleton screens per panel type
 *
 * Renders a loading placeholder for chart components:
 * - Chart area rectangle
 * - X-axis placeholder
 * - Y-axis placeholder
 */

export interface ChartSkeletonProps {
  /** Height of the chart area in pixels (default: 200) */
  height?: number;
  /** Show axis placeholders (default: true) */
  showAxes?: boolean;
  /** Variant: 'line' | 'bar' | 'area' (default: 'line') */
  variant?: 'line' | 'bar' | 'area';
}

/**
 * Creates HTML for chart skeleton loading state
 *
 * @param props - Configuration options
 * @returns HTML string for the skeleton
 */
export function ChartSkeleton(props: ChartSkeletonProps = {}): string {
  const { height = 200, showAxes = true, variant = 'line' } = props;

  const axes = showAxes ? `
    <div class="skeleton-chart-y-axis">
      <div class="skeleton-axis-label"></div>
      <div class="skeleton-axis-label"></div>
      <div class="skeleton-axis-label"></div>
    </div>
    <div class="skeleton-chart-x-axis">
      <div class="skeleton-axis-label"></div>
      <div class="skeleton-axis-label"></div>
      <div class="skeleton-axis-label"></div>
      <div class="skeleton-axis-label"></div>
    </div>
  ` : '';

  return `
    <div class="skeleton-chart skeleton-chart-${variant}" role="status" aria-label="Loading chart..." style="--chart-height: ${height}px;">
      ${axes}
      <div class="skeleton-chart-area"></div>
    </div>
  `;
}

/**
 * Renders chart skeleton directly into a container element
 *
 * @param container - DOM element to render into
 * @param props - Configuration options
 */
export function renderChartSkeleton(
  container: HTMLElement,
  props: ChartSkeletonProps = {}
): void {
  container.innerHTML = ChartSkeleton(props);
}
