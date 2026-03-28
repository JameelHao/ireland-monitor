/**
 * Generate smooth Great Circle paths for submarine cables
 * FR #189: Fix cable display to show smooth curves instead of polylines
 * FR #196: Added LOD (Level of Detail) support for performance optimization
 */
import { geoInterpolate, geoDistance } from 'd3-geo';

/**
 * LOD levels for cable path rendering
 * FR #196: Performance optimization - reduce path complexity at low zoom levels
 */
export type CableLODLevel = 'minimal' | 'reduced' | 'full';

/**
 * Get LOD level based on map zoom
 * @param zoom - Current map zoom level
 * @returns LOD level to use for cable rendering
 */
export function getCableLODLevel(zoom: number): CableLODLevel {
  if (zoom < 5) return 'minimal';   // Global view: endpoints only
  if (zoom < 8) return 'reduced';   // Regional view: key waypoints
  return 'full';                    // Detail view: full path
}

/**
 * Simplify cable path based on LOD level
 * FR #196: Reduce path points for better performance at low zoom
 *
 * @param path - Full cable path waypoints
 * @param lodLevel - LOD level to apply
 * @returns Simplified path based on LOD level
 */
export function getCablePathWithLOD(
  path: [number, number][],
  lodLevel: CableLODLevel
): [number, number][] {
  if (path.length < 2) return path;

  switch (lodLevel) {
    case 'minimal':
      // Only start and end points (2 points total)
      return [path[0]!, path[path.length - 1]!];

    case 'reduced': {
      // Every 5th point + first and last (approximately 6-7 points for 30-point path)
      const reduced: [number, number][] = [path[0]!];
      for (let i = 5; i < path.length - 1; i += 5) {
        reduced.push(path[i]!);
      }
      reduced.push(path[path.length - 1]!);
      return reduced;
    }

    default:
      return path;
  }
}

/**
 * Generate a smooth Great Circle path between waypoints
 * Uses d3-geo interpolation to create smooth curves
 *
 * @param waypoints - Array of [lng, lat] coordinates
 * @param pointsPerKm - Sampling density (default: 1 point per 50km)
 * @returns Array of interpolated [lng, lat] coordinates forming a smooth curve
 */
export function generateSmoothGreatCirclePath(
  waypoints: [number, number][],
  pointsPerKm = 1 / 50
): [number, number][] {
  if (waypoints.length < 2) return waypoints;

  const allPoints: [number, number][] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    if (!start || !end) continue;

    // Calculate distance in radians, convert to km (Earth radius ≈ 6371km)
    const distanceRadians = geoDistance(start, end);
    const distanceKm = distanceRadians * 6371;

    // Determine number of interpolation points based on distance
    // Minimum 20 points for short cables, scale up for longer ones
    const numPoints = Math.max(20, Math.floor(distanceKm * pointsPerKm));

    // D3 Great Circle interpolation
    const interpolate = geoInterpolate(start, end);

    // Generate intermediate points
    for (let j = 0; j < numPoints; j++) {
      const t = j / numPoints;
      allPoints.push(interpolate(t) as [number, number]);
    }
  }

  // Add final waypoint
  const lastWaypoint = waypoints[waypoints.length - 1];
  if (lastWaypoint) {
    allPoints.push(lastWaypoint);
  }

  return allPoints;
}
