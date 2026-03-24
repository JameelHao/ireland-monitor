/**
 * Marker Icons Service
 *
 * Provides icon definitions for deck.gl IconLayer.
 * Uses inline SVG data URLs with glowing effects for worldmonitor-style appearance.
 *
 * Design principles:
 * - All markers are circles (unified visual language)
 * - Tier 1: Large (24px) with radial gradient glow
 * - Tier 2: Medium (16px) with subtle glow
 * - Tier 3: Small (12px) minimal glow
 */

import type { MarkerTier } from './marker-tier';

// Keep MarkerShape for backwards compatibility, but all shapes map to circle
export type MarkerShape = 'circle' | 'diamond' | 'triangle' | 'square';

/**
 * Icon definition for deck.gl IconLayer
 */
export interface IconDefinition {
  id: string;
  url: string;
  width: number;
  height: number;
  mask: boolean;
  anchorY: number;
}

/**
 * Get icon name based on shape and tier
 * Note: All shapes now use circle icons for unified design
 */
export function getMarkerIconName(_shape: MarkerShape, tier: MarkerTier): string {
  const sizeLabel = tier === 1 ? 'large' : tier === 2 ? 'medium' : 'small';
  return `circle-${sizeLabel}`;
}

/**
 * Get icon size based on tier
 * Tier 1 icons are larger to accommodate glow effect
 */
export function getMarkerSizeForTier(tier: MarkerTier, _shape: MarkerShape = 'circle'): number {
  // Tier 1 needs extra space for glow effect
  return tier === 1 ? 48 : tier === 2 ? 32 : 24;
}

/**
 * Generate glowing circle SVG data URL
 * Uses radial gradient and multiple layers for glow effect
 */
function generateGlowingCircleSvg(tier: MarkerTier): string {
  if (tier === 1) {
    // Tier 1: Large circle with full glow effect + animation-ready
    // Size: 48x48 to accommodate glow
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="50%" stop-color="white" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Outer glow layer (most transparent) -->
      <circle cx="24" cy="24" r="20" fill="url(#glow1)" opacity="0.3"/>
      <!-- Middle glow layer -->
      <circle cx="24" cy="24" r="14" fill="url(#glow1)" opacity="0.5"/>
      <!-- Core circle with glow filter -->
      <circle cx="24" cy="24" r="10" fill="white" opacity="0.9" filter="url(#blur1)"/>
    </svg>`;
  } else if (tier === 2) {
    // Tier 2: Medium circle with subtle glow
    // Size: 32x32
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="70%" stop-color="white" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Subtle outer glow -->
      <circle cx="16" cy="16" r="12" fill="url(#glow2)" opacity="0.4"/>
      <!-- Core circle -->
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.85"/>
    </svg>`;
  } else {
    // Tier 3: Small circle with minimal glow
    // Size: 24x24
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <!-- Minimal glow layer -->
      <circle cx="12" cy="12" r="8" fill="white" opacity="0.3"/>
      <!-- Core circle -->
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.8"/>
    </svg>`;
  }
}

/**
 * Generate SVG data URL for a glowing circle marker
 */
function generateSvgDataUrl(_shape: MarkerShape, tier: MarkerTier): string {
  // All shapes use circle with glow effect
  const svg = generateGlowingCircleSvg(tier);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Pre-cached icon definitions for stable references
 * deck.gl IconLayer requires stable object references for getIcon
 */
const ICON_CACHE: Record<string, IconDefinition> = {};

/**
 * Get cached icon definition for a specific shape and tier
 * Returns the same object reference for the same parameters
 * Note: All shapes now render as glowing circles
 */
export function getMarkerIcon(shape: MarkerShape, tier: MarkerTier): IconDefinition {
  // All shapes use the same circle icon per tier
  const key = `circle-${tier}`;
  if (!ICON_CACHE[key]) {
    const size = getMarkerSizeForTier(tier, shape);
    ICON_CACHE[key] = {
      id: key,
      url: generateSvgDataUrl(shape, tier),
      width: size,
      height: size,
      mask: true,
      anchorY: size / 2, // Center anchor for better glow effect
    };
  }
  return ICON_CACHE[key];
}

/**
 * Icon mapping for IconLayer (legacy format, kept for tests)
 * Updated sizes to match new glowing circle dimensions
 */
export const MARKER_ICON_MAPPING: Record<string, { x: number; y: number; width: number; height: number; mask: boolean }> = {
  // All shapes now map to circle icons with glow-appropriate sizes
  'circle-small': { x: 0, y: 0, width: 24, height: 24, mask: true },
  'circle-medium': { x: 0, y: 0, width: 32, height: 32, mask: true },
  'circle-large': { x: 0, y: 0, width: 48, height: 48, mask: true },
  // Legacy shape names kept for backwards compatibility (all render as circles)
  'diamond-small': { x: 0, y: 0, width: 24, height: 24, mask: true },
  'diamond-medium': { x: 0, y: 0, width: 32, height: 32, mask: true },
  'diamond-large': { x: 0, y: 0, width: 48, height: 48, mask: true },
  'triangle-small': { x: 0, y: 0, width: 24, height: 24, mask: true },
  'triangle-medium': { x: 0, y: 0, width: 32, height: 32, mask: true },
  'triangle-large': { x: 0, y: 0, width: 48, height: 48, mask: true },
  'square-small': { x: 0, y: 0, width: 24, height: 24, mask: true },
  'square-medium': { x: 0, y: 0, width: 32, height: 32, mask: true },
  'square-large': { x: 0, y: 0, width: 48, height: 48, mask: true },
};

/**
 * Get icon URL for a specific shape and tier
 * Note: All shapes return circle icon URLs
 */
export function getMarkerIconUrl(_shape: MarkerShape, tier: MarkerTier): string {
  const sizeLabel = tier === 1 ? 'large' : tier === 2 ? 'medium' : 'small';
  return `/icons/map-markers/circle-${sizeLabel}.svg`;
}

/**
 * Layer color palette (worldmonitor-inspired)
 * High saturation colors for better visibility with glow effects
 */
export const LAYER_COLORS = {
  // Core infrastructure - Purple tones
  semiconductorHubs: [168, 85, 247] as [number, number, number], // #A855F7
  dataCenters: [147, 51, 234] as [number, number, number],       // #9333EA

  // Tech HQs - Blue tones
  techHQs: [14, 165, 233] as [number, number, number],           // #0EA5E9

  // Unicorns & Startups - Warm tones
  irishUnicorns: [249, 115, 22] as [number, number, number],     // #F97316
  startupHubs: [239, 68, 68] as [number, number, number],        // #EF4444
  accelerators: [236, 72, 153] as [number, number, number],      // #EC4899

  // Cloud infrastructure - Teal
  cloudRegions: [20, 184, 166] as [number, number, number],      // #14B8A6
};

/**
 * Get color for a layer type
 */
export function getLayerColor(layerType: keyof typeof LAYER_COLORS): [number, number, number] {
  return LAYER_COLORS[layerType] || [128, 128, 128];
}
