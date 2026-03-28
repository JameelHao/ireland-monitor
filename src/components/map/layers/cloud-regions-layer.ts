/**
 * Cloud Regions Layer
 * FR #207: Extracted from DeckGLMap.ts for better modularity
 *
 * Renders cloud provider regions (AWS, Azure, GCP) on the map
 * Ireland variant uses larger, more prominent markers
 */
import { ScatterplotLayer } from '@deck.gl/layers';
import { SITE_VARIANT } from '@/config';
import type { CloudRegion } from '@/config/tech-geo';

/** Default cloud region marker color */
const CLOUD_REGION_COLOR: [number, number, number, number] = [153, 102, 255, 200];

/** Check if running Ireland variant */
function isIrelandVariant(): boolean {
  return SITE_VARIANT === 'ireland';
}

/**
 * Creates the cloud regions visualization layer
 *
 * @param visibleRegions - Filtered list of cloud regions to display
 * @returns ScatterplotLayer for deck.gl rendering
 *
 * Features:
 * - Purple markers for cloud regions
 * - Ireland variant: larger markers with white stroke
 * - Consistent sizing with min/max pixel constraints
 */
export function createCloudRegionsLayer(visibleRegions: CloudRegion[]): ScatterplotLayer<CloudRegion> {
  const isIreland = isIrelandVariant();

  return new ScatterplotLayer<CloudRegion>({
    id: 'cloud-regions-layer',
    data: visibleRegions,
    getPosition: (d) => [d.lon, d.lat],
    getRadius: isIreland ? 20000 : 12000,
    getFillColor: isIreland ? [153, 102, 255, 235] : CLOUD_REGION_COLOR,
    radiusMinPixels: isIreland ? 9 : 4,
    radiusMaxPixels: isIreland ? 18 : 12,
    stroked: isIreland,
    getLineColor: isIreland
      ? ([255, 255, 255, 220] as [number, number, number, number])
      : ([0, 0, 0, 0] as [number, number, number, number]),
    lineWidthMinPixels: isIreland ? 1.5 : 0,
    pickable: true,
  });
}
