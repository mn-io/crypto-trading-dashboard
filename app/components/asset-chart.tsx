'use client';

// eslint-disable-next-line import/no-named-as-default
import Big from 'big.js';
import { useState } from 'react';
import { Area, ReferenceLine, YAxis, ResponsiveContainer, AreaChart, Tooltip } from 'recharts';

import { getBig } from '../bigJsStringCache';
import { ChartDatum, chartSelector } from '../store/chartSlice';
import { useAppSelector } from '../store/hooks';

const paddingLabel = 4;
const charWidth = 6;
const moreLeft = 5;
const minInt = getBig(Number.MAX_SAFE_INTEGER);
const maxInt = getBig(Number.MIN_SAFE_INTEGER);

function getMinMax(data: ChartDatum[]): { min: Big; max: Big } {
  if (data.length === 0) {
    return { min: getBig(0), max: getBig(0) };
  }

  let min = minInt;
  let max = maxInt;

  for (const d of data) {
    try {
      const value = getBig(d.price);
      if (value.lt(min)) min = value;
      if (value.gt(max)) max = value;
    } catch {
      // skip invalid entries
    }
  }

  return { min, max };
}

function roundToTwoDigits(num: Big, roundUp: boolean): Big {
  if (num.eq(getBig(0))) {
    return getBig(0);
  }

  // compute scaling factor like 10^(log10(num) - 1)
  const exponent = num.e; // e.g. for 1234 -> 3
  const digits = getBig(10).pow(exponent - 1);
  const bigNum = num.div(digits);

  const rounded = roundUp ? bigNum.round(0, Big.roundUp) : bigNum.round(0, Big.roundDown);

  return rounded.times(digits);
}

const linearGradientDef = (
  <defs>
    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#e5f7f6" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#b2e4e5" stopOpacity={0} />
    </linearGradient>
  </defs>
);

function getTicks(
  min: Big,
  max: Big,
  prevClose: Big | null,
  current: Big | null,
  highlightedValue: Big | null,
  steps = 6,
): string[] {
  const ticks: Big[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const value = max.minus(min).times(ratio).plus(min);
    ticks.push(value);
  }
  if (prevClose) {
    ticks.push(prevClose);
  }

  if (current) {
    ticks.push(current);
  }

  if (highlightedValue) {
    ticks.push(highlightedValue);
  }

  return [...new Set(ticks.map((tick) => tick.toString()))]; // remove potential dupplicates, set preserves insertion order
}

const createTicks =
  (maxLabel: Big, prevCloseRounded: Big, currentRounded: Big, highlightedValue: Big | null) =>
  ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
    let textColor = 'var(--color-graph-label-text)';
    let backgroundColor = 'var(--color-graph-label-bg)';

    const width = maxLabel.toString().length * charWidth;
    let fixLeft = 0;
    if (payload.value === prevCloseRounded.toString()) {
      textColor = 'var(--color-graph-label-bg)';
      backgroundColor = 'var(--color-graph-label-bg-prevclose)';
      fixLeft = -5;
    } else {
      if (payload.value === currentRounded.toString()) {
        textColor = 'var(--color-graph-label-bg)';
        backgroundColor = 'var(--color-graph-label-text)';
      }
      if (highlightedValue && payload.value === highlightedValue.toString()) {
        textColor = 'var(--color-graph-label-bg)';
        backgroundColor = 'var(--color-graph-label-text)';
      }
    }

    return (
      <g key={`tick-${payload.value}-${x}-${y}-${textColor}-${backgroundColor}`}>
        <rect
          x={x + moreLeft + fixLeft}
          y={y - 12}
          width={paddingLabel + width + paddingLabel - fixLeft}
          height={16}
          fill={backgroundColor}
          rx={4}
          ry={4}
        />
        <text x={x + paddingLabel + moreLeft} y={y} fill={textColor} fontSize={10}>
          {payload.value}
        </text>
      </g>
    );
  };

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDatum; value: string }[];
}

const ChartDatumTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const datum = payload[0].payload;
    return (
      <div className="rounded-lg bg-white p-2 shadow-md">
        <p className="text-sm">Time: {new Date(datum.time).toLocaleString('de-DE')}</p>
        <p className="text-sm">
          Price: {datum.price} {process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}
        </p>
      </div>
    );
  }
  return null;
};

export default function AssetChart() {
  const transactions = useAppSelector((state) => state.transactions);
  const chartData = useAppSelector(chartSelector);
  const [highlightedValue, setHighlightedValue] = useState<Big | null>(null);

  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <section className="p-4">
        <div className="h-64 flex flex-col items-center justify-center space-y-2">
          <h2 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_ASSET}</h2>
          <h3>No chart data available</h3>
        </div>
      </section>
    );
  }

  const prevCloseRounded = getBig(chartData[0].price).round(0, Big.roundDown);

  const prevCloseRoundedTwoDigits = getBig(chartData[0].price)
    .times(100)
    .round(0, Big.roundDown)
    .div(100);

  const currentRounded = getBig(chartData[chartData.length - 1].price).round(0, Big.roundDown);

  const { min: minValue, max: maxValue } = getMinMax(chartData);

  const { minLabel, maxLabel } = {
    minLabel: roundToTwoDigits(minValue, false),
    maxLabel: roundToTwoDigits(maxValue, true),
  };

  const pnlBig = getBig(transactions.pnl).round(2, 0);
  const isPositive = pnlBig.gte(0);
  const pnlFormatted = (isPositive ? '+' : '') + pnlBig.toFixed(2).toString();

  return (
    <section className="p-0 relative lg:-top-20">
      <div className="h-64 flex flex-col items-center justify-center space-y-2">
        <h2 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_ASSET}</h2>
        <h2 className="text-xl font-semibold">
          {prevCloseRoundedTwoDigits.toString()} {process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}
        </h2>
        <div className={isPositive ? 'text-green-500' : 'text-red-500'}>
          PnL: {pnlFormatted} {process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}
        </div>

        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              height={400}
              data={chartData}
              margin={{
                top: 10,
              }}
              onMouseMove={(state) => {
                const hoveredIndex = Number(state.activeIndex);
                const hoveredDataPoint = chartData[hoveredIndex];
                if (hoveredDataPoint?.price) {
                  try {
                    const value = getBig(hoveredDataPoint.price);
                    setHighlightedValue(value.round(0, Big.roundHalfUp));
                  } catch {
                    setHighlightedValue(null);
                  }
                } else {
                  setHighlightedValue(null);
                }
              }}
              onMouseLeave={() => setHighlightedValue(null)}
            >
              <Tooltip content={<ChartDatumTooltip />} />
              <YAxis
                orientation="right"
                tickLine={false}
                axisLine={false}
                interval={0}
                ticks={getTicks(
                  minLabel,
                  maxLabel,
                  prevCloseRounded,
                  currentRounded,
                  highlightedValue,
                )}
                tick={createTicks(maxLabel, prevCloseRounded, currentRounded, highlightedValue)}
              />
              <ReferenceLine
                y={prevCloseRounded.toString()}
                stroke="var(--color-graph-ref-line)"
                strokeWidth={1}
                strokeDasharray="2 3"
                label={({ viewBox }) => {
                  const { x, y, width } = viewBox;
                  return (
                    <g>
                      <rect
                        x={width - charWidth * 10}
                        y={y - 12}
                        width={charWidth * 12.22}
                        height={16}
                        fill="var(--color-graph-fill)"
                        rx={4}
                        ry={4}
                      />
                      <text
                        x={x + width - paddingLabel}
                        y={y}
                        fontSize={10}
                        textAnchor="end"
                        fill="var(--color-graph-label-bg)"
                      >
                        Prev close
                      </text>
                    </g>
                  );
                }}
              />
              {highlightedValue && (
                <ReferenceLine
                  y={highlightedValue.toString()}
                  stroke="var(--color-graph-ref-line)"
                  strokeWidth={2}
                  strokeDasharray="2 3"
                />
              )}
              ){linearGradientDef}
              <Area
                type="linear"
                name=""
                dataKey="price"
                stroke="var(--color-graph-stroke)"
                strokeWidth={2}
                fill="url(#colorUv)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
