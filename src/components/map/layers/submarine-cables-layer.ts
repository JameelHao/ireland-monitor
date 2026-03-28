/**
 * Submarine Cables Layer
 * FR #207: Extracted from DeckGLMap.ts for better modularity
 *
 * Renders Ireland's submarine cable connections with:
 * - Smooth Great Circle arc interpolation
 * - LOD (Level of Detail) for zoom-based simplification
 * - Color coding by destination
 */
import { PathLayer } from '@deck.gl/layers';
import {
  IRELAND_SUBMARINE_CABLES,
  CABLE_COLORS,
  type SubmarineCable,
} from '@/config/variants/ireland/data';
import {
  generateSmoothGreatCirclePath,
  getCableLODLevel,
  getCablePathWithLOD,
} from '@/utils/geo-smooth-path';

/** Cable with pre-computed smooth path for rendering */
type CableWithPath = SubmarineCable & { smoothPath: [number, number][] };

/**
 * Creates the submarine cables visualization layer
 *
 * @param zoom - Current map zoom level for LOD calculation
 * @returns PathLayer for deck.gl rendering
 *
 * Features:
 * - Smooth interpolated paths (Great Circle arcs via d3-geo)
 * - LOD-based simplification (fewer points at low zoom)
 * - Color coding: different colors for US/UK/EU destinations
 * - Opacity: planned/under-construction cables are more transparent
 * - Width: active cables are thicker
 */
export function createSubmarineCablesLayer(zoom: number): PathLayer<CableWithPath> {
  // FR #196: Determine LOD level based on current zoom
  const lodLevel = getCableLODLevel(zoom);

  // Pre-generate smooth paths with LOD-based simplification
  // Low zoom: fewer points for better performance
  // High zoom: full detail for visual quality
  const cablesWithSmoothPaths: CableWithPath[] = IRELAND_SUBMARINE_CABLES.map((cable) => {
    // Apply LOD simplification to the source waypoints
    const lodPath = getCablePathWithLOD(cable.path, lodLevel);
    // Generate smooth curve from the (potentially simplified) waypoints
    return {
      ...cable,
      smoothPath: generateSmoothGreatCirclePath(lodPath),
    };
  });

  return new PathLayer<CableWithPath>({
    id: 'submarine-cables-layer',
    data: cablesWithSmoothPaths,
    // Use the pre-generated smooth path
    getPath: (d) => d.smoothPath.map(([lng, lat]) => [lng, lat, 0] as [number, number, number]),
    getColor: (d) => {
      const color = CABLE_COLORS[d.destination];
      const alpha = d.status === 'planned' || d.status === 'under-construction' ? 150 : 220;
      return [...color, alpha] as [number, number, number, number];
    },
    getWidth: (d) => (d.status === 'active' ? 3 : 2),
    widthMinPixels: 2,
    widthMaxPixels: 6,
    pickable: true,
    // Smooth line caps and joints for better visual quality
    capRounded: true,
    jointRounded: true,
    // FR #196: Update layer when zoom changes (LOD transition)
    updateTriggers: {
      getPath: [lodLevel],
    },
  });
}
