import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateSmoothGreatCirclePath } from '../src/utils/geo-smooth-path.js';

describe('generateSmoothGreatCirclePath', () => {
  it('returns input unchanged for single point', () => {
    const input: [number, number][] = [[-6.26, 53.35]];
    const result = generateSmoothGreatCirclePath(input);
    assert.deepEqual(result, input);
  });

  it('returns input unchanged for empty array', () => {
    const result = generateSmoothGreatCirclePath([]);
    assert.deepEqual(result, []);
  });

  it('generates interpolated points for two waypoints', () => {
    // Dublin to London
    const waypoints: [number, number][] = [
      [-6.26, 53.35], // Dublin
      [-0.13, 51.51], // London
    ];
    const result = generateSmoothGreatCirclePath(waypoints);

    // Should have more points than input
    assert.ok(result.length > 2, 'Should generate intermediate points');

    // First and last points should be close to original waypoints
    assert.ok(Math.abs(result[0]![0] - waypoints[0]![0]) < 0.01);
    assert.ok(Math.abs(result[0]![1] - waypoints[0]![1]) < 0.01);
    assert.ok(Math.abs(result[result.length - 1]![0] - waypoints[1]![0]) < 0.01);
    assert.ok(Math.abs(result[result.length - 1]![1] - waypoints[1]![1]) < 0.01);
  });

  it('generates more points for longer distances', () => {
    // Short distance: Dublin to London (~460km)
    const shortWaypoints: [number, number][] = [
      [-6.26, 53.35], // Dublin
      [-0.13, 51.51], // London
    ];
    const shortResult = generateSmoothGreatCirclePath(shortWaypoints);

    // Long distance: Dublin to New York (~5100km)
    const longWaypoints: [number, number][] = [
      [-6.26, 53.35], // Dublin
      [-74.01, 40.71], // New York
    ];
    const longResult = generateSmoothGreatCirclePath(longWaypoints);

    // Longer distance should generate more points
    assert.ok(
      longResult.length > shortResult.length,
      `Long path (${longResult.length}) should have more points than short path (${shortResult.length})`
    );
  });

  it('handles multi-waypoint paths (e.g., NY -> Halifax -> Dublin)', () => {
    const waypoints: [number, number][] = [
      [-74.01, 40.71], // New York
      [-63.58, 44.65], // Halifax
      [-6.26, 53.35], // Dublin
    ];
    const result = generateSmoothGreatCirclePath(waypoints);

    // Should generate many points for this long route
    assert.ok(result.length > 50, `Should have many points, got ${result.length}`);

    // Last point should be Dublin
    const lastPoint = result[result.length - 1]!;
    assert.ok(Math.abs(lastPoint[0] - (-6.26)) < 0.01);
    assert.ok(Math.abs(lastPoint[1] - 53.35) < 0.01);
  });

  it('generates points that follow Great Circle (northward arc for transatlantic)', () => {
    // Dublin to New York - Great Circle should curve northward
    const waypoints: [number, number][] = [
      [-6.26, 53.35], // Dublin
      [-74.01, 40.71], // New York
    ];
    const result = generateSmoothGreatCirclePath(waypoints);

    // The midpoint should be north of the direct line
    // Direct line midpoint latitude would be ~47
    // Great Circle should go further north (around 52-55)
    const midIndex = Math.floor(result.length / 2);
    const midPoint = result[midIndex]!;

    // Great Circle from Dublin to NYC curves north, so midpoint lat should be > 50
    assert.ok(
      midPoint[1] > 50,
      `Midpoint latitude ${midPoint[1]} should be > 50 (Great Circle curves north)`
    );
  });

  it('all generated points are valid coordinates', () => {
    const waypoints: [number, number][] = [
      [-6.26, 53.35], // Dublin
      [-74.01, 40.71], // New York
    ];
    const result = generateSmoothGreatCirclePath(waypoints);

    for (const [lng, lat] of result) {
      assert.ok(lng >= -180 && lng <= 180, `Longitude ${lng} out of range`);
      assert.ok(lat >= -90 && lat <= 90, `Latitude ${lat} out of range`);
    }
  });
});
