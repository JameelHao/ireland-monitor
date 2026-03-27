/**
 * Generate smooth Great Circle paths for submarine cables
 * FR #189: Fix cable display to show smooth curves instead of polylines
 */
import { geoInterpolate, geoDistance } from 'd3-geo';

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
