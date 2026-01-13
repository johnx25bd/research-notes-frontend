"use client";

import { useEffect, useRef } from 'react';
import type { DecayFunction } from './types';

interface DecayCurveChartProps {
  maxBufferDistance: number;
  baseRate: number;
  outerRate: number;
  decayFunction: DecayFunction;
  height?: number;
}

function applyDecay(
  normalizedDistance: number,
  decayFn: DecayFunction,
  baseRate: number,
  outerRate: number
): number {
  if (normalizedDistance <= 0) return baseRate;
  if (normalizedDistance >= 1) return outerRate;

  switch (decayFn.type) {
    case 'linear':
      return baseRate - (baseRate - outerRate) * normalizedDistance;

    case 'exponential': {
      const lambda = decayFn.lambda ?? 2;
      return outerRate + (baseRate - outerRate) * Math.exp(-lambda * normalizedDistance);
    }

    case 'sigmoid': {
      const sigmoid = 1 / (1 + Math.exp(10 * (normalizedDistance - 0.5)));
      return outerRate + (baseRate - outerRate) * sigmoid;
    }

    default:
      return baseRate - (baseRate - outerRate) * normalizedDistance;
  }
}

export function DecayCurveChart({
  maxBufferDistance,
  baseRate,
  outerRate,
  decayFunction,
  height = 120,
}: DecayCurveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual width from container
    const width = container.offsetWidth;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with device pixel ratio for crisp rendering
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Chart dimensions with padding
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Colors
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const curveColor = '#14b8a6'; // teal-500
    const zoneColor = '#22c55e'; // green-500

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Horizontal grid lines (rate)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines (distance)
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Draw axes labels
    ctx.fillStyle = textColor;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (distance) - show in meters if < 1km
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth * i) / 4;
      const distance = (maxBufferDistance * i) / 4;
      const label = maxBufferDistance < 1
        ? `${(distance * 1000).toFixed(0)}m`
        : `${distance.toFixed(1)}km`;
      ctx.fillText(label, x, height - 8);
    }

    // Y-axis labels (rate)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4;
      const rate = baseRate - ((baseRate - outerRate) * i) / 4;
      ctx.fillText(`${(rate * 100).toFixed(0)}%`, padding.left - 8, y + 3);
    }

    // Draw "Zone" indicator at x=0
    ctx.fillStyle = zoneColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(padding.left - 2, padding.top, 4, chartHeight);
    ctx.globalAlpha = 1;

    // Draw decay curve
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const points = 100;
    for (let i = 0; i <= points; i++) {
      const normalizedDist = i / points;
      const rate = applyDecay(normalizedDist, decayFunction, baseRate, outerRate);

      const x = padding.left + normalizedDist * chartWidth;
      const y = padding.top + ((baseRate - rate) / (baseRate - outerRate)) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw curve fill
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = curveColor;
    ctx.globalAlpha = 0.1;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw axis labels
    ctx.fillStyle = textColor;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Distance from zone boundary', padding.left + chartWidth / 2, height - 2);

    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(12, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Exchange Rate', 0, 0);
    ctx.restore();

  }, [maxBufferDistance, baseRate, outerRate, decayFunction, height]);

  // Re-render on resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Trigger re-render by forcing a state update
        const event = new Event('resize');
        canvas.dispatchEvent(event);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}
