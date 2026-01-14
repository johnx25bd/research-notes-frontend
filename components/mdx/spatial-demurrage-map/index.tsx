"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { SpatialDemurrageMapProps } from './types';

// Dynamically import MapContainer to avoid SSR issues with MapLibre GL
const MapContainer = dynamic(
  () => import('./map-container').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 rounded-lg border border-border bg-muted/50 flex items-center justify-center" style={{ height: 450 }}>
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    ),
  }
);

export function SpatialDemurrageMap({ src, zone, ...props }: SpatialDemurrageMapProps) {
  const [loadedZone, setLoadedZone] = useState<Feature<Polygon | MultiPolygon> | null>(
    zone || null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (src && !zone) {
      // Load GeoJSON from src path (relative to /attachments)
      const url = src.startsWith('/') ? src : `/attachments/${src}`;
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load ${url}`);
          return res.json();
        })
        .then((data) => setLoadedZone(data))
        .catch((err) => setError(err.message));
    }
  }, [src, zone]);

  if (error) {
    return (
      <div className="my-8 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        Error loading map: {error}
      </div>
    );
  }

  if (!loadedZone) {
    return (
      <div className="my-8 rounded-lg border border-border bg-muted/50 flex items-center justify-center" style={{ height: 450 }}>
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    );
  }

  return <MapContainer zone={loadedZone} {...props} />;
}

export type { SpatialDemurrageMapProps } from './types';
