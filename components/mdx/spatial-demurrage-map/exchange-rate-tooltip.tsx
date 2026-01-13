"use client";

interface ExchangeRateTooltipProps {
  x: number;
  y: number;
  rate: number;
  distance: number;
  baseRate: number;
}

export function ExchangeRateTooltip({
  x,
  y,
  rate,
  distance,
  baseRate,
}: ExchangeRateTooltipProps) {
  const percentage = ((rate / baseRate) * 100).toFixed(1);
  const isAtPar = distance === 0;

  return (
    <div
      className="absolute pointer-events-none z-10 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border border-border text-sm"
      style={{
        left: x + 12,
        top: y - 10,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="font-medium">
        Exchange Rate:{' '}
        <span className={isAtPar ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
          {rate.toFixed(3)}
        </span>
      </div>
      <div className="text-muted-foreground text-xs">
        {isAtPar ? (
          'At par (inside zone)'
        ) : (
          <>
            {percentage}% of par &middot; {distance.toFixed(1)}km from zone
          </>
        )}
      </div>
    </div>
  );
}
