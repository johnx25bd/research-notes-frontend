"use client";

import dynamic from 'next/dynamic';
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

export function SpatialDemurrageMap(props: SpatialDemurrageMapProps) {
  return <MapContainer {...props} />;
}

export type { SpatialDemurrageMapProps } from './types';
