import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import type { DecayFunction } from './types';

/**
 * Calculate distance from a point to the nearest zone boundary.
 * Returns 0 if point is inside zone, positive distance if outside.
 */
export function distanceToZone(
  point: [number, number],
  zone: Feature<Polygon | MultiPolygon>
): number {
  const pt = turf.point(point);

  // Check if point is inside zone
  if (turf.booleanPointInPolygon(pt, zone)) {
    return 0;
  }

  // Calculate distance to nearest zone boundary
  // For MultiPolygon, this finds the closest boundary of any polygon
  return turf.pointToPolygonDistance(pt, zone, { units: 'kilometers' });
}

/**
 * Calculate exchange rate based on distance from zone boundary.
 */
export function calculateExchangeRate(
  point: [number, number],
  zone: Feature<Polygon | MultiPolygon>,
  baseRate: number,
  outerRate: number,
  maxDistance: number,
  decayFn: DecayFunction
): { rate: number; distance: number } {
  const distance = distanceToZone(point, zone);

  // Inside zone - full rate
  if (distance === 0) {
    return { rate: baseRate, distance: 0 };
  }

  // Beyond max distance - minimum rate
  if (distance >= maxDistance) {
    return { rate: outerRate, distance };
  }

  // Apply decay function
  const normalizedDistance = distance / maxDistance;
  let rate: number;

  switch (decayFn.type) {
    case 'linear':
      rate = baseRate - (baseRate - outerRate) * normalizedDistance;
      break;

    case 'exponential': {
      const lambda = decayFn.lambda ?? 2;
      rate = outerRate + (baseRate - outerRate) * Math.exp(-lambda * normalizedDistance);
      break;
    }

    case 'sigmoid': {
      // Sigmoid centered at 0.5 normalized distance
      const sigmoid = 1 / (1 + Math.exp(10 * (normalizedDistance - 0.5)));
      rate = outerRate + (baseRate - outerRate) * sigmoid;
      break;
    }

    case 'step': {
      // Find applicable step
      const steps = decayFn.steps ?? [];
      const sortedSteps = [...steps].sort((a, b) => a.distance - b.distance);
      rate = outerRate;
      for (const step of sortedSteps) {
        if (distance <= step.distance) {
          rate = step.rate;
          break;
        }
      }
      break;
    }

    default:
      rate = baseRate - (baseRate - outerRate) * normalizedDistance;
  }

  return { rate, distance };
}

/**
 * Generate concentric buffer polygons for visualization.
 */
export function generateBufferRings(
  zone: Feature<Polygon | MultiPolygon>,
  maxDistance: number,
  ringCount: number
): FeatureCollection {
  const features: Feature<Polygon | MultiPolygon>[] = [];
  const step = maxDistance / ringCount;

  // Generate rings from outermost to innermost for proper layering
  for (let i = ringCount; i >= 1; i--) {
    const bufferDist = step * i;
    const buffer = turf.buffer(zone, bufferDist, { units: 'kilometers' });

    if (buffer) {
      features.push({
        ...buffer,
        properties: {
          ringIndex: i,
          distance: bufferDist,
          // Opacity decreases toward outer rings
          opacity: 0.15 * (1 - (i - 1) / ringCount),
        },
      } as Feature<Polygon | MultiPolygon>);
    }
  }

  return turf.featureCollection(features);
}

/**
 * Calculate the center of a zone polygon.
 */
export function getZoneCenter(zone: Feature<Polygon | MultiPolygon>): [number, number] {
  const centroid = turf.centroid(zone);
  return centroid.geometry.coordinates as [number, number];
}
