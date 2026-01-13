"use client";

import { useState, useCallback, useMemo, useRef } from 'react';
import Map, { Source, Layer, type MapLayerMouseEvent, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { ExchangeRateTooltip } from './exchange-rate-tooltip';
import { ControlsPanel } from './controls-panel';
import { HeatmapOverlay } from './heatmap-overlay';
import { DecayCurveChart } from './decay-curve-chart';
import {
  calculateExchangeRate,
  getZoneCenter,
} from './utils';
import {
  DEFAULT_MAP_STYLE,
  DEFAULT_ZOOM,
  DEFAULT_HEIGHT,
  DEFAULT_MAX_BUFFER_DISTANCE,
  DEFAULT_BASE_RATE,
  DEFAULT_OUTER_RATE,
  DEFAULT_DECAY_FUNCTION,
  ZONE_COLOR,
} from './constants';
import type { SpatialDemurrageMapProps, MapParams, HoverInfo } from './types';

export function MapContainer({
  zone,
  center,
  zoom = DEFAULT_ZOOM,
  maxBufferDistance = DEFAULT_MAX_BUFFER_DISTANCE,
  baseRate = DEFAULT_BASE_RATE,
  outerRate = DEFAULT_OUTER_RATE,
  decayFunction = DEFAULT_DECAY_FUNCTION,
  height = DEFAULT_HEIGHT,
  showControls = false,
  mapStyle = DEFAULT_MAP_STYLE,
  caption,
}: SpatialDemurrageMapProps) {
  const mapRef = useRef<MapRef>(null);

  // State for interactive parameters
  const [params, setParams] = useState<MapParams>({
    maxBufferDistance,
    baseRate,
    outerRate,
    decayFunction,
  });

  // Tooltip state
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  // Calculate center from zone if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    return getZoneCenter(zone);
  }, [zone, center]);

  // Handle mouse move for tooltip
  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const { lngLat, point } = event;
      const { rate, distance } = calculateExchangeRate(
        [lngLat.lng, lngLat.lat],
        zone,
        params.baseRate,
        params.outerRate,
        params.maxBufferDistance,
        params.decayFunction
      );

      setHoverInfo({
        x: point.x,
        y: point.y,
        lngLat: [lngLat.lng, lngLat.lat],
        rate,
        distance,
      });
    },
    [zone, params]
  );

  const onMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <figure className="my-8 not-prose -mx-4 sm:-mx-8 lg:-mx-16 xl:-mx-24 relative z-10">
      <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
        {/* Explainer */}
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <p className="text-lg text-muted-foreground">
            <strong className="text-foreground">Spatial demurrage</strong> applies a distance-based
            decay to transfer rates. Inside the zone, transactions occur at full rate.
            As distance increases, the rate decays according to the selected function.
          </p>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="px-4 py-4 border-b border-border bg-background/30">
            <ControlsPanel params={params} onParamsChange={setParams} />
          </div>
        )}

        {/* Decay Curve Chart */}
        {showControls && (
          <div className="px-4 py-3 border-b border-border">
            <DecayCurveChart
              maxBufferDistance={params.maxBufferDistance}
              baseRate={params.baseRate}
              outerRate={params.outerRate}
              decayFunction={params.decayFunction}
              height={120}
            />
          </div>
        )}

        {/* Map */}
        <div
          className="relative overflow-hidden"
          style={{ height: heightStyle }}
        >
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: mapCenter[0],
              latitude: mapCenter[1],
              zoom,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            cursor="crosshair"
          >
            {/* Heatmap buffer rings - rendered as MapLibre layers for GPU acceleration */}
            <HeatmapOverlay
              zone={zone}
              maxBufferDistance={params.maxBufferDistance}
              baseRate={params.baseRate}
              outerRate={params.outerRate}
              decayFunction={params.decayFunction}
            />

            {/* Zone polygon outline only */}
            <Source id="zone" type="geojson" data={zone}>
              <Layer
                id="zone-fill"
                type="fill"
                paint={{
                  'fill-color': ZONE_COLOR,
                  'fill-opacity': 0,
                }}
              />
              <Layer
                id="zone-outline"
                type="line"
                paint={{
                  'line-color': ZONE_COLOR,
                  'line-width': 2.5,
                }}
              />
            </Source>
          </Map>

          {/* Exchange rate tooltip */}
          {hoverInfo && (
            <ExchangeRateTooltip
              x={hoverInfo.x}
              y={hoverInfo.y}
              rate={hoverInfo.rate}
              distance={hoverInfo.distance}
              baseRate={params.baseRate}
            />
          )}
        </div>
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
