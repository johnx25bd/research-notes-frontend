"use client";

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { MapParams, DecayFunctionType } from './types';

interface ControlsPanelProps {
  params: MapParams;
  onParamsChange: (params: MapParams) => void;
}

const DECAY_TYPES: { value: DecayFunctionType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'exponential', label: 'Exponential' },
  { value: 'sigmoid', label: 'Sigmoid' },
];

export function ControlsPanel({ params, onParamsChange }: ControlsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Decay Function Selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">
          Decay Function
        </label>
        <div className="flex gap-2">
          {DECAY_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={params.decayFunction.type === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                onParamsChange({
                  ...params,
                  decayFunction: {
                    ...params.decayFunction,
                    type: type.value,
                  },
                })
              }
              className="flex-1 text-xs sm:text-sm"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Parameters - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground flex justify-between mb-2">
            <span>Buffer Distance</span>
            <span className="text-foreground font-normal">
              {params.maxBufferDistance < 1
                ? `${(params.maxBufferDistance * 1000).toFixed(0)}m`
                : `${params.maxBufferDistance.toFixed(1)}km`}
            </span>
          </label>
          <Slider
            value={[params.maxBufferDistance * 1000]} // Work in meters
            onValueChange={(values: number[]) =>
              onParamsChange({ ...params, maxBufferDistance: values[0] / 1000 })
            }
            min={100}
            max={5000}
            step={100}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground flex justify-between mb-2">
            <span>Outer Rate</span>
            <span className="text-foreground font-normal">{(params.outerRate * 100).toFixed(0)}%</span>
          </label>
          <Slider
            value={[params.outerRate * 100]}
            onValueChange={(values: number[]) =>
              onParamsChange({ ...params, outerRate: values[0] / 100 })
            }
            min={0}
            max={100}
            step={5}
          />
        </div>

        {/* Lambda control - only for exponential */}
        {params.decayFunction.type === 'exponential' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground flex justify-between mb-2">
              <span>Decay Rate (λ)</span>
              <span className="text-foreground font-normal">{params.decayFunction.lambda?.toFixed(1)}</span>
            </label>
            <Slider
              value={[params.decayFunction.lambda ?? 2]}
              onValueChange={(values: number[]) =>
                onParamsChange({
                  ...params,
                  decayFunction: { ...params.decayFunction, lambda: values[0] },
                })
              }
              min={0.5}
              max={5}
              step={0.1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
