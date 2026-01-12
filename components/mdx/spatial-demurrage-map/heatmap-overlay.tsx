"use client";

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import buffer from '@turf/buffer';
import difference from '@turf/difference';
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import type { DecayFunction } from './types';

interface HeatmapOverlayProps {
  zone: Feature<Polygon | MultiPolygon>;
  maxBufferDistance: number;
  baseRate: number;
  outerRate: number;
  decayFunction: DecayFunction;
}

// Number of rings for smooth gradient effect
const NUM_RINGS = 30;

// Color palette for the heatmap (desaturated for better transparency)
const COLORS = {
  high: [72, 187, 120],   // Softer green - full rate
  mid: [236, 201, 75],    // Softer yellow - mid rate
  low: [229, 115, 115],   // Softer red - low rate
};

function applyDecay(normalizedDistance: number, decayFn: DecayFunction): number {
  if (normalizedDistance <= 0) return 1;
  if (normalizedDistance >= 1) return 0;

  switch (decayFn.type) {
    case 'linear':
      return 1 - normalizedDistance;
    case 'exponential': {
      const lambda = decayFn.lambda ?? 2;
      return Math.exp(-lambda * normalizedDistance);
    }
    case 'sigmoid':
      return 1 / (1 + Math.exp(10 * (normalizedDistance - 0.5)));
    default:
      return 1 - normalizedDistance;
  }
}

function interpolateColor(factor: number): string {
  let r: number, g: number, b: number;

  if (factor >= 0.5) {
    const t = (factor - 0.5) * 2;
    r = Math.round(COLORS.mid[0] + (COLORS.high[0] - COLORS.mid[0]) * t);
    g = Math.round(COLORS.mid[1] + (COLORS.high[1] - COLORS.mid[1]) * t);
    b = Math.round(COLORS.mid[2] + (COLORS.high[2] - COLORS.mid[2]) * t);
  } else {
    const t = factor * 2;
    r = Math.round(COLORS.low[0] + (COLORS.mid[0] - COLORS.low[0]) * t);
    g = Math.round(COLORS.low[1] + (COLORS.mid[1] - COLORS.low[1]) * t);
    b = Math.round(COLORS.low[2] + (COLORS.mid[2] - COLORS.low[2]) * t);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

export function HeatmapOverlay({
  zone,
  maxBufferDistance,
  baseRate,
  outerRate,
  decayFunction,
}: HeatmapOverlayProps) {
  // Generate buffer rings as GeoJSON donuts - memoized so it only recalculates when params change
  const bufferRings = useMemo(() => {
    const features: Feature<Polygon | MultiPolygon>[] = [];

    // Pre-compute all buffer polygons (starting from 1, not 0 - zone interior has no overlay)
    const buffers: (Feature<Polygon | MultiPolygon> | undefined)[] = [zone];
    for (let i = 1; i <= NUM_RINGS; i++) {
      const distance = (maxBufferDistance * i) / NUM_RINGS;
      buffers.push(buffer(zone, distance, { units: 'kilometers' }));
    }

    // Add zone interior with base rate color
    const zoneColor = interpolateColor(baseRate);
    features.push({
      ...zone,
      properties: {
        color: zoneColor,
        ring: 0,
      },
    });

    // Create donut rings (outer minus inner) for decay outside the zone
    for (let i = NUM_RINGS; i >= 1; i--) {
      const normalizedDist = i / NUM_RINGS;
      const decayFactor = applyDecay(normalizedDist, decayFunction);
      // Calculate actual exchange rate - color is based on absolute rate, not relative decay
      const actualRate = outerRate + decayFactor * (baseRate - outerRate);
      const color = interpolateColor(actualRate);

      const outer = buffers[i];
      const inner = buffers[i - 1];

      if (!outer || !inner) continue;

      // Create donut: outer minus inner
      try {
        const donut = difference({
          type: 'FeatureCollection',
          features: [outer, inner],
        });
        if (donut) {
          features.push({
            ...donut,
            properties: {
              color,
              ring: i,
            },
          } as Feature<Polygon | MultiPolygon>);
        }
      } catch {
        // If difference fails, skip this ring
      }
    }

    return {
      type: 'FeatureCollection' as const,
      features,
    } as FeatureCollection<Polygon | MultiPolygon>;
  }, [zone, maxBufferDistance, baseRate, outerRate, decayFunction]);

  return (
    <Source id="decay-heatmap" type="geojson" data={bufferRings}>
      <Layer
        id="decay-heatmap-fill"
        type="fill"
        paint={{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.6,
        }}
      />
    </Source>
  );
}
