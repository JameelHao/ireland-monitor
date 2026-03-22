/**
 * Marker Icons Service
 *
 * Provides icon mapping for deck.gl IconLayer.
 * Uses white SVG icons that are colored via getColor accessor.
 */

import type { MarkerTier } from './marker-tier';

export type MarkerShape = 'diamond' | 'square' | 'hexagon' | 'star';

export interface IconMapping {
  [key: string]: {
    x: number;
    y: number;
    width: number;
    height: number;
    mask: boolean;
  };
}

/**
 * Get icon name based on shape and tier
 */
export function getMarkerIconName(shape: MarkerShape, tier: MarkerTier): string {
  const sizeLabel = tier === 1 ? 'large' : tier === 2 ? 'medium' : 'small';
  return `${shape}-${sizeLabel}`;
}

/**
 * Get icon size based on tier
 */
export function getMarkerSizeForTier(tier: MarkerTier, shape: MarkerShape = 'diamond'): number {
  if (shape === 'star' && tier === 1) return 28; // Stars are slightly larger
  return tier === 1 ? 24 : tier === 2 ? 16 : 12;
}

/**
 * Icon mapping for IconLayer using individual SVG files
 * Each icon is a separate SVG that will be loaded from the icons folder
 */
export const MARKER_ICON_MAPPING: IconMapping = {
  // Diamond shapes
  'diamond-small': { x: 0, y: 0, width: 12, height: 12, mask: true },
  'diamond-medium': { x: 0, y: 0, width: 16, height: 16, mask: true },
  'diamond-large': { x: 0, y: 0, width: 24, height: 24, mask: true },
  // Square shapes
  'square-small': { x: 0, y: 0, width: 12, height: 12, mask: true },
  'square-medium': { x: 0, y: 0, width: 16, height: 16, mask: true },
  'square-large': { x: 0, y: 0, width: 24, height: 24, mask: true },
  // Hexagon shapes
  'hexagon-small': { x: 0, y: 0, width: 12, height: 12, mask: true },
  'hexagon-medium': { x: 0, y: 0, width: 16, height: 16, mask: true },
  'hexagon-large': { x: 0, y: 0, width: 24, height: 24, mask: true },
  // Star shapes
  'star-small': { x: 0, y: 0, width: 12, height: 12, mask: true },
  'star-medium': { x: 0, y: 0, width: 16, height: 16, mask: true },
  'star-large': { x: 0, y: 0, width: 28, height: 28, mask: true },
};

/**
 * Get icon URL for a specific shape and tier
 */
export function getMarkerIconUrl(shape: MarkerShape, tier: MarkerTier): string {
  const iconName = getMarkerIconName(shape, tier);
  return `/icons/map-markers/${iconName}.svg`;
}
