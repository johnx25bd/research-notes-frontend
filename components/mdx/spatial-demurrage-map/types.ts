import type { Feature, Polygon, MultiPolygon } from 'geojson';

export type DecayFunctionType = 'linear' | 'exponential' | 'sigmoid' | 'step';

export interface DecayFunction {
  type: DecayFunctionType;
  /** For exponential: rate = baseRate * e^(-lambda * distance) */
  lambda?: number;
  /** For step: discrete zones */
  steps?: { distance: number; rate: number }[];
}

export interface SpatialDemurrageMapProps {
  /** GeoJSON polygon defining the economic activity zone */
  zone: Feature<Polygon | MultiPolygon>;

  /** Center coordinates [lng, lat] - auto-calculated from zone if not provided */
  center?: [number, number];

  /** Initial zoom level */
  zoom?: number;

  /** Maximum decay buffer distance in kilometers */
  maxBufferDistance?: number;

  /** Number of buffer rings to render */
  bufferRings?: number;

  /** Base exchange rate at zone center (1.0 = par value) */
  baseRate?: number;

  /** Exchange rate at max buffer distance */
  outerRate?: number;

  /** Decay function configuration */
  decayFunction?: DecayFunction;

  /** Map height in pixels or CSS value */
  height?: number | string;

  /** Enable interactive parameter controls */
  showControls?: boolean;

  /** Custom map style URL */
  mapStyle?: string;

  /** Caption text below map */
  caption?: string;
}

export interface MapParams {
  maxBufferDistance: number;
  baseRate: number;
  outerRate: number;
  decayFunction: DecayFunction;
}

export interface HoverInfo {
  x: number;
  y: number;
  lngLat: [number, number];
  rate: number;
  distance: number;
}
