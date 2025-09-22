'use client';

// eslint-disable-next-line import/no-named-as-default
import Big from 'big.js';
import { useState } from 'react';
import { Area, ReferenceLine, YAxis, ResponsiveContainer, AreaChart } from 'recharts';

import { ChartDatum } from '../store/chartSlice';
import { useAppSelector } from '../store/hooks';

const paddingLabel = 4;
const charWidth = 6;

function getMinMax(data: ChartDatum[]): { min: Big; max: Big } {
  if (!data || data.length === 0) {
    return { min: new Big(0), max: new Big(0) };
  }

  let min: Big = new Big(Number.MAX_SAFE_INTEGER);
  let max: Big = new Big(Number.MIN_SAFE_INTEGER);

  for (const d of data) {
    try {
      const value = new Big(d.price);

      if (value.lt(min)) min = value;
      if (value.gt(max)) max = value;
    } catch {
      // skip invalid entries
    }
  }

  return { min, max };
}

function roundToTwoDigits(num: Big, roundUp: boolean): Big {
  if (num.eq(new Big(0))) {
    return new Big(0);
  }

  // compute scaling factor like 10^(log10(num) - 1)
  const exponent = num.e; // e.g. for 1234 -> 3
  const digits = new Big(10).pow(exponent - 1);
  const bigNum = num.div(digits);

  const rounded = roundUp
    ? bigNum.round(0, Big.roundUp) // ceil equivalent
    : bigNum.round(0, Big.roundDown); // floor equivalent

  return rounded.times(digits);
}

function createRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  corners = { topLeft: true, topRight: true, bottomRight: true, bottomLeft: true },
): string {
  const tl = corners.topLeft ? radius : 0;
  const tr = corners.topRight ? radius : 0;
  const br = corners.bottomRight ? radius : 0;
  const bl = corners.bottomLeft ? radius : 0;

  return `
    M ${x + tl} ${y}
    H ${x + width - tr}
    ${tr ? `A ${tr} ${tr} 0 0 1 ${x + width} ${y + tr}` : ''}
    V ${y + height - br}
    ${br ? `A ${br} ${br} 0 0 1 ${x + width - br} ${y + height}` : ''}
    H ${x + bl}
    ${bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + height - bl}` : ''}
    V ${y + tl}
    ${tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : ''}
    Z
  `;
}

function getTicks(
  min: Big,
  max: Big,
  prevClose: Big | null,
  current: Big | null,
  highlightedValue: string | null,
  steps = 6,
): string[] {
  const ticks: Big[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const value = new Big(max).minus(min).times(ratio).plus(min);
    ticks.push(value);
  }
  if (prevClose) {
    ticks.push(prevClose);
  }

  if (current) {
    ticks.push(current);
  }

  if (highlightedValue) {
    ticks.push(new Big(highlightedValue));
  }

  return [...new Set(ticks.map((tick) => tick.toString()))]; // remove potential dupplicates, set preserves insertion order
}

export default function AssetChart() {
  const transactions = useAppSelector((state) => state.transactions);
  const chartData = useAppSelector((state) => state.chart.data);
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);

  const hasData =
    chartData &&
    chartData.length > 0 &&
    (() => {
      try {
        new Big(chartData[0].price);
        return true;
      } catch {
        console.error('Price value is invalid, not a number (big.js), in:', chartData[0]);
        return false;
      }
    })();

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

  const prevCloseRounded = hasData ? new Big(chartData[0].price).round(0, Big.roundDown) : null;

  const prevCloseRoundedTwoDigits = hasData
    ? new Big(chartData[0].price).times(100).round(0, Big.roundDown).div(100)
    : null;

  const currentRounded = hasData
    ? new Big(chartData[chartData.length - 1].price).round(0, Big.roundDown)
    : null;

  const { min: minValue, max: maxValue } = getMinMax(chartData);

  const { minLabel, maxLabel } = {
    minLabel: roundToTwoDigits(minValue, false),
    maxLabel: roundToTwoDigits(maxValue, true),
  };

  const pnlBig = new Big(transactions.pnl).round(2, 0);
  const isPositive = pnlBig.gte(0);
  const pnlFormatted = (isPositive ? '+' : '') + pnlBig.toFixed(2).toString();

  return (
    <section className="p-4">
      <div className="h-64 flex flex-col items-center justify-center space-y-2">
        <h2 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_ASSET}</h2>
        <h2 className="text-xl font-semibold">
          {prevCloseRoundedTwoDigits?.toString()} {process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}
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
                    const value = new Big(hoveredDataPoint.price);
                    setHighlightedValue(value.round(0, Big.roundHalfUp).toString());
                  } catch {
                    setHighlightedValue(null);
                  }
                } else {
                  setHighlightedValue(null);
                }
              }}
              onMouseLeave={() => setHighlightedValue(null)}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5f7f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#b2e4e5" stopOpacity={0} />
                </linearGradient>
              </defs>

              {prevCloseRounded && (
                <ReferenceLine
                  y={prevCloseRounded?.toString()}
                  stroke="var(--color-graph-ref-line)"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  label={({ viewBox }) => {
                    const { x, y, width } = viewBox;
                    return (
                      <g>
                        <path
                          d={createRoundedRectPath(
                            width - charWidth * 10,
                            y - 12,
                            charWidth * 15,
                            16,
                            4,
                            {
                              topLeft: true,
                              topRight: false,
                              bottomRight: false,
                              bottomLeft: true,
                            },
                          )}
                          fill="var(--color-graph-fill)"
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
              )}

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
                tick={({ x, y, payload }) => {
                  let textColor = 'var(--color-graph-label-text)';
                  let backgroundColor = 'var(--color-graph-label-bg)';
                  let roundedBorderLeft = true;

                  const width = (maxLabel + '').length * charWidth;
                  if (prevCloseRounded && payload.value === prevCloseRounded.toString()) {
                    textColor = 'var(--color-graph-label-bg)';
                    backgroundColor = 'var(--color-graph-label-bg-prevclose)';
                    roundedBorderLeft = false;
                  } else {
                    if (currentRounded !== null && payload.value === currentRounded.toString()) {
                      textColor = 'var(--color-graph-label-bg)';
                      backgroundColor = 'var(--color-graph-label-text)';
                    }
                    if (
                      highlightedValue !== null &&
                      payload.value === highlightedValue.toString()
                    ) {
                      textColor = 'var(--color-graph-label-bg)';
                      backgroundColor = 'var(--color-graph-label-text)';
                    }
                  }

                  return (
                    <g key={`tick-${payload.value}-${x}-${y}-${textColor}-${backgroundColor}`}>
                      <path
                        d={createRoundedRectPath(
                          x,
                          y - 12,
                          paddingLabel + width + paddingLabel,
                          16,
                          4,
                          {
                            topLeft: roundedBorderLeft,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: roundedBorderLeft,
                          },
                        )}
                        fill={backgroundColor}
                      />
                      <text x={x + paddingLabel} y={y} fill={textColor} fontSize={10}>
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
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
