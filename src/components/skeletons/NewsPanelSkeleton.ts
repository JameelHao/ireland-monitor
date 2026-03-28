/**
 * News Panel Skeleton
 * FR #208: Enhanced skeleton screens per panel type
 *
 * Renders a loading placeholder matching the NewsPanel layout:
 * - Headline (wide bar)
 * - Meta info (short bar with source/time)
 * Repeats for the expected number of news items
 */

export interface NewsPanelSkeletonProps {
  /** Number of news item placeholders to show (default: 5) */
  rows?: number;
}

/**
 * Creates HTML for news panel skeleton loading state
 *
 * @param props - Configuration options
 * @returns HTML string for the skeleton
 */
export function NewsPanelSkeleton(props: NewsPanelSkeletonProps = {}): string {
  const { rows = 5 } = props;

  const items = Array.from({ length: rows }, () => `
    <div class="skeleton-card skeleton-news-item" aria-hidden="true">
      <div class="skeleton-headline"></div>
      <div class="skeleton-meta">
        <div class="skeleton-source"></div>
        <div class="skeleton-time"></div>
      </div>
    </div>
  `).join('');

  return `
    <div class="skeleton-panel skeleton-news" role="status" aria-label="Loading news...">
      ${items}
    </div>
  `;
}

/**
 * Renders news skeleton directly into a container element
 *
 * @param container - DOM element to render into
 * @param props - Configuration options
 */
export function renderNewsPanelSkeleton(
  container: HTMLElement,
  props: NewsPanelSkeletonProps = {}
): void {
  container.innerHTML = NewsPanelSkeleton(props);
}
