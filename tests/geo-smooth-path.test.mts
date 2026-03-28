import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateSmoothGreatCirclePath, getCableLODLevel, getCablePathWithLOD } from '../src/utils/geo-smooth-path.js';

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

// FR #196: LOD (Level of Detail) tests
describe('getCableLODLevel', () => {
  it('returns minimal for zoom < 5', () => {
    assert.equal(getCableLODLevel(2), 'minimal');
    assert.equal(getCableLODLevel(4.9), 'minimal');
  });

  it('returns reduced for zoom 5-8', () => {
    assert.equal(getCableLODLevel(5), 'reduced');
    assert.equal(getCableLODLevel(6), 'reduced');
    assert.equal(getCableLODLevel(7.9), 'reduced');
  });

  it('returns full for zoom >= 8', () => {
    assert.equal(getCableLODLevel(8), 'full');
    assert.equal(getCableLODLevel(10), 'full');
    assert.equal(getCableLODLevel(15), 'full');
  });
});

describe('getCablePathWithLOD', () => {
  const samplePath: [number, number][] = [
    [-74.006, 40.7128],   // 0 - New York
    [-72.0, 41.2],        // 1
    [-70.0, 41.8],        // 2
    [-68.0, 42.5],        // 3
    [-66.0, 43.2],        // 4
    [-64.5, 43.9],        // 5
    [-63.5752, 44.6488],  // 6 - Halifax
    [-60.0, 46.5],        // 7
    [-56.0, 48.5],        // 8
    [-52.0, 50.8],        // 9
    [-48.0, 53.2],        // 10
    [-44.0, 55.5],        // 11
    [-40.0, 57.5],        // 12
    [-36.0, 59.0],        // 13
    [-32.0, 59.8],        // 14
    [-28.0, 59.5],        // 15
    [-24.0, 58.5],        // 16
    [-20.0, 57.0],        // 17
    [-16.0, 55.0],        // 18
    [-14.0, 54.5],        // 19
    [-12.0, 54.2],        // 20
    [-10.0, 54.0],        // 21
    [-8.0, 53.7],         // 22
    [-7.0, 53.5],         // 23
    [-6.5, 53.4],         // 24
    [-6.2603, 53.3498],   // 25 - Dublin
    [-4.0, 52.8],         // 26
    [-2.0, 52.2],         // 27
    [-0.1278, 51.5074],   // 28 - London
  ];

  it('minimal LOD returns only 2 points (start and end)', () => {
    const result = getCablePathWithLOD(samplePath, 'minimal');
    assert.equal(result.length, 2);
    assert.deepEqual(result[0], samplePath[0]);
    assert.deepEqual(result[1], samplePath[samplePath.length - 1]);
  });

  it('reduced LOD returns approximately 7 points', () => {
    const result = getCablePathWithLOD(samplePath, 'reduced');
    // First point + every 5th point + last point
    // For 29 points: [0, 5, 10, 15, 20, 25, 28] = 7 points
    assert.ok(result.length >= 5 && result.length <= 10, `Expected 5-10 points, got ${result.length}`);
    assert.deepEqual(result[0], samplePath[0]); // First point preserved
    assert.deepEqual(result[result.length - 1], samplePath[samplePath.length - 1]); // Last point preserved
  });

  it('full LOD returns all points', () => {
    const result = getCablePathWithLOD(samplePath, 'full');
    assert.equal(result.length, samplePath.length);
    assert.deepEqual(result, samplePath);
  });

  it('handles short paths gracefully', () => {
    const shortPath: [number, number][] = [[-6.26, 53.35]];
    assert.deepEqual(getCablePathWithLOD(shortPath, 'minimal'), shortPath);
    assert.deepEqual(getCablePathWithLOD(shortPath, 'reduced'), shortPath);
    assert.deepEqual(getCablePathWithLOD(shortPath, 'full'), shortPath);
  });

  it('handles 2-point paths correctly', () => {
    const twoPoints: [number, number][] = [[-6.26, 53.35], [-0.13, 51.51]];
    // All LOD levels should return the same 2 points
    assert.deepEqual(getCablePathWithLOD(twoPoints, 'minimal'), twoPoints);
    assert.deepEqual(getCablePathWithLOD(twoPoints, 'reduced'), twoPoints);
    assert.deepEqual(getCablePathWithLOD(twoPoints, 'full'), twoPoints);
  });
});
