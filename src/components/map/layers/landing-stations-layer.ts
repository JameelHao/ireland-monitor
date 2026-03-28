/**
 * Landing Stations Layer
 * FR #207: Extracted from DeckGLMap.ts for better modularity
 *
 * Renders cable landing points in Ireland (Dublin, Galway, Cork)
 * Uses red color to distinguish from data centers
 */
import { IconLayer } from '@deck.gl/layers';
import {
  IRELAND_LANDING_STATIONS,
  type LandingStation,
} from '@/config/variants/ireland/data';
import { getMarkerIcon, getMarkerSizeForTier } from '@/services/marker-icons';

/**
 * Creates the landing stations visualization layer (FR #174)
 *
 * @returns IconLayer for deck.gl rendering
 *
 * Features:
 * - Red markers (#EF4444) to distinguish from data centers
 * - Circle icons with consistent sizing
 * - Pickable for popup interactions
 */
export function createLandingStationsLayer(): IconLayer<LandingStation> {
  return new IconLayer<LandingStation>({
    id: 'landing-stations-layer',
    data: IRELAND_LANDING_STATIONS,
    getPosition: (d) => [d.lng, d.lat],
    getIcon: () => getMarkerIcon('circle', 1),
    getSize: () => getMarkerSizeForTier(1, 'circle') * 1.2,
    // Red color (#EF4444) for landing stations
    getColor: () => [239, 68, 68, 255] as [number, number, number, number],
    sizeScale: 1,
    sizeMinPixels: 14,
    sizeMaxPixels: 40,
    pickable: true,
  });
}
