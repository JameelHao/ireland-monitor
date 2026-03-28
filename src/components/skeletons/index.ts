/**
 * Skeleton Components - Re-exports
 * FR #208: Enhanced skeleton screens per panel type
 *
 * Panel-specific skeleton loading states that match actual content layout
 * to minimize Cumulative Layout Shift (CLS).
 */

// News panel skeleton
export {
  NewsPanelSkeleton,
  renderNewsPanelSkeleton,
  type NewsPanelSkeletonProps,
} from './NewsPanelSkeleton';

// Market panel skeleton
export {
  MarketPanelSkeleton,
  renderMarketPanelSkeleton,
  type MarketPanelSkeletonProps,
} from './MarketPanelSkeleton';

// Insights panel skeleton
export {
  InsightsPanelSkeleton,
  renderInsightsPanelSkeleton,
  type InsightsPanelSkeletonProps,
} from './InsightsPanelSkeleton';

// Chart skeleton
export {
  ChartSkeleton,
  renderChartSkeleton,
  type ChartSkeletonProps,
} from './ChartSkeleton';
