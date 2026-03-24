/**
 * Marker Icons Tests
 *
 * Tests for glowing circle marker icons.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMarkerIconName,
  getMarkerSizeForTier,
  getMarkerIcon,
  getMarkerIconUrl,
  getLayerColor,
  MARKER_ICON_MAPPING,
  LAYER_COLORS,
} from '../src/services/marker-icons.js';
import type { MarkerShape } from '../src/services/marker-icons.js';

describe('Marker Icon Names', () => {
  it('should return circle icon name for all shapes', () => {
    // All shapes now use circle icons
    assert.equal(getMarkerIconName('circle', 1), 'circle-large');
    assert.equal(getMarkerIconName('diamond', 1), 'circle-large');
    assert.equal(getMarkerIconName('triangle', 1), 'circle-large');
    assert.equal(getMarkerIconName('square', 1), 'circle-large');
  });

  it('should return correct size label for each tier', () => {
    assert.equal(getMarkerIconName('circle', 1), 'circle-large');
    assert.equal(getMarkerIconName('circle', 2), 'circle-medium');
    assert.equal(getMarkerIconName('circle', 3), 'circle-small');
  });
});

describe('Marker Sizes', () => {
  it('should return larger sizes for glow effect', () => {
    // Tier 1 is 48px to accommodate glow
    assert.equal(getMarkerSizeForTier(1), 48);
    // Tier 2 is 32px
    assert.equal(getMarkerSizeForTier(2), 32);
    // Tier 3 is 24px
    assert.equal(getMarkerSizeForTier(3), 24);
  });

  it('should return same size regardless of shape', () => {
    const shapes: MarkerShape[] = ['circle', 'diamond', 'triangle', 'square'];
    for (const shape of shapes) {
      assert.equal(getMarkerSizeForTier(1, shape), 48);
      assert.equal(getMarkerSizeForTier(2, shape), 32);
      assert.equal(getMarkerSizeForTier(3, shape), 24);
    }
  });
});

describe('Marker Icon Definition', () => {
  it('should return valid icon definition for tier 1', () => {
    const icon = getMarkerIcon('circle', 1);

    assert.ok(icon.id);
    assert.ok(icon.url.startsWith('data:image/svg+xml;base64,'));
    assert.equal(icon.width, 48);
    assert.equal(icon.height, 48);
    assert.equal(icon.mask, true);
    assert.equal(icon.anchorY, 24); // Center anchor
  });

  it('should return valid icon definition for tier 2', () => {
    const icon = getMarkerIcon('circle', 2);

    assert.equal(icon.width, 32);
    assert.equal(icon.height, 32);
    assert.equal(icon.anchorY, 16);
  });

  it('should return valid icon definition for tier 3', () => {
    const icon = getMarkerIcon('circle', 3);

    assert.equal(icon.width, 24);
    assert.equal(icon.height, 24);
    assert.equal(icon.anchorY, 12);
  });

  it('should return same icon for all shapes (unified circles)', () => {
    const circleIcon = getMarkerIcon('circle', 1);
    const diamondIcon = getMarkerIcon('diamond', 1);
    const triangleIcon = getMarkerIcon('triangle', 1);
    const squareIcon = getMarkerIcon('square', 1);

    // All shapes return the same circle icon
    assert.equal(circleIcon.id, diamondIcon.id);
    assert.equal(circleIcon.id, triangleIcon.id);
    assert.equal(circleIcon.id, squareIcon.id);
  });

  it('should cache icon definitions', () => {
    const icon1 = getMarkerIcon('circle', 1);
    const icon2 = getMarkerIcon('circle', 1);

    // Same object reference (cached)
    assert.equal(icon1, icon2);
  });
});

describe('Icon URL', () => {
  it('should return circle SVG URL for all shapes', () => {
    assert.equal(getMarkerIconUrl('circle', 1), '/icons/map-markers/circle-large.svg');
    assert.equal(getMarkerIconUrl('diamond', 1), '/icons/map-markers/circle-large.svg');
    assert.equal(getMarkerIconUrl('triangle', 2), '/icons/map-markers/circle-medium.svg');
    assert.equal(getMarkerIconUrl('square', 3), '/icons/map-markers/circle-small.svg');
  });
});

describe('Icon Mapping', () => {
  it('should have updated sizes for glow effect', () => {
    // Tier 1 (large) should be 48x48
    assert.equal(MARKER_ICON_MAPPING['circle-large'].width, 48);
    assert.equal(MARKER_ICON_MAPPING['circle-large'].height, 48);

    // Tier 2 (medium) should be 32x32
    assert.equal(MARKER_ICON_MAPPING['circle-medium'].width, 32);
    assert.equal(MARKER_ICON_MAPPING['circle-medium'].height, 32);

    // Tier 3 (small) should be 24x24
    assert.equal(MARKER_ICON_MAPPING['circle-small'].width, 24);
    assert.equal(MARKER_ICON_MAPPING['circle-small'].height, 24);
  });

  it('should have all legacy shape names', () => {
    const shapes = ['circle', 'diamond', 'triangle', 'square'];
    const sizes = ['small', 'medium', 'large'];

    for (const shape of shapes) {
      for (const size of sizes) {
        const key = `${shape}-${size}`;
        assert.ok(MARKER_ICON_MAPPING[key], `Missing mapping for ${key}`);
        assert.equal(MARKER_ICON_MAPPING[key].mask, true);
      }
    }
  });
});

describe('Layer Colors', () => {
  it('should have all layer colors defined', () => {
    assert.ok(LAYER_COLORS.semiconductorHubs);
    assert.ok(LAYER_COLORS.dataCenters);
    assert.ok(LAYER_COLORS.techHQs);
    assert.ok(LAYER_COLORS.irishUnicorns);
    assert.ok(LAYER_COLORS.startupHubs);
    assert.ok(LAYER_COLORS.accelerators);
    assert.ok(LAYER_COLORS.cloudRegions);
  });

  it('should return RGB tuple format', () => {
    const color = LAYER_COLORS.semiconductorHubs;
    assert.equal(color.length, 3);
    assert.ok(color[0] >= 0 && color[0] <= 255);
    assert.ok(color[1] >= 0 && color[1] <= 255);
    assert.ok(color[2] >= 0 && color[2] <= 255);
  });

  it('getLayerColor should return correct color', () => {
    assert.deepEqual(getLayerColor('semiconductorHubs'), [168, 85, 247]);
    assert.deepEqual(getLayerColor('dataCenters'), [147, 51, 234]);
    assert.deepEqual(getLayerColor('techHQs'), [14, 165, 233]);
    assert.deepEqual(getLayerColor('irishUnicorns'), [249, 115, 22]);
  });

  it('getLayerColor should return gray for unknown layer', () => {
    // @ts-expect-error - Testing invalid layer type
    const color = getLayerColor('unknownLayer');
    assert.deepEqual(color, [128, 128, 128]);
  });
});

describe('SVG Data URL', () => {
  it('tier 1 icon should contain glow filter', () => {
    const icon = getMarkerIcon('circle', 1);
    const svg = atob(icon.url.replace('data:image/svg+xml;base64,', ''));

    assert.ok(svg.includes('radialGradient'));
    assert.ok(svg.includes('feGaussianBlur'));
    assert.ok(svg.includes('filter'));
  });

  it('tier 2 icon should contain radial gradient', () => {
    const icon = getMarkerIcon('circle', 2);
    const svg = atob(icon.url.replace('data:image/svg+xml;base64,', ''));

    assert.ok(svg.includes('radialGradient'));
  });

  it('tier 3 icon should be simple circles', () => {
    const icon = getMarkerIcon('circle', 3);
    const svg = atob(icon.url.replace('data:image/svg+xml;base64,', ''));

    assert.ok(svg.includes('<circle'));
    // Tier 3 doesn't need heavy filters
    assert.ok(!svg.includes('feGaussianBlur'));
  });

  it('all icons should use white fill for mask coloring', () => {
    for (let tier = 1; tier <= 3; tier++) {
      const icon = getMarkerIcon('circle', tier as 1 | 2 | 3);
      const svg = atob(icon.url.replace('data:image/svg+xml;base64,', ''));
      assert.ok(svg.includes('white'), `Tier ${tier} should use white fill`);
    }
  });
});
