'use client'

import { useEffect, useState } from "react";
import { Area, ReferenceLine, YAxis, ResponsiveContainer, AreaChart } from 'recharts';

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchChartData, ChartDatum } from "../store/chartSlice";

const paddingLabel = 4;
const charWidth = 6;

function getMinMax(data: ChartDatum[]): { min: number; max: number } {
  if (!data || data.length === 0) {
    return { min: 0, max: 0 };
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const d of data) {
    const value = parseFloat(d.priceUsd);
    if (!isNaN(value)) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  return { min, max };
}

function roundToTwoDigits(num: number, roundUp: boolean): number {
  const digits = Math.pow(10, Math.floor(Math.log10(num)) - 1); // - 1: 2digits-1
  if (roundUp) {
    return Math.ceil(num / digits) * digits;
  } else {
    return Math.floor(num / digits) * digits;
  }
}

function filterCloseValues(values: number[], threshold = 0.1): number[] {
  if (!values || values.length === 0) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const result: number[] = [];

  for (const val of sorted) {
    if (result.length === 0) {
      result.push(val);
    } else {
      const prev = result[result.length - 1];
      if (Math.abs(val - prev) / prev >= threshold) {
        // far enough -> keep
        result.push(val);
      } else {
        // too close -> replace previous with current
        result[result.length - 1] = val;
      }
    }
  }

  return result;
}

function getTicks(min: number, max: number, prevClose: number | null, current: number | null, highlightedValue: number | null, steps = 6): number[] {
  let ticks: number[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const value = min + (max - min) * ratio
    ticks.push(value);
  }

  if (!!prevClose) {
    ticks.push(prevClose)
  }

  if (!!current) {
    ticks.push(current)
  }

  ticks.sort((a, b) => a - b); // sort ascending
  ticks = filterCloseValues(ticks);
  if (!!highlightedValue) {
    ticks.push(highlightedValue)
    ticks.sort((a, b) => a - b); // sort ascending
  }

  return ticks;
}

export default function AssetChart() {
  const dispatch = useAppDispatch();
  const data: ChartDatum[] = useAppSelector((state) => state.chart.data);
  const [highlightedValue, setHighlightedValue] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchChartData());
  }, [dispatch]);

  // console.log("data received:", data)

  const prevCloseRounded = !!data && data.length >= 1 ? Math.floor(parseFloat(data[0].priceUsd)) : null;
  const prevCloseRoundedTwoDigits = !!data && data.length >= 1 ? Math.floor(parseFloat(data[0].priceUsd) * 100) / 100 : null;
  const currentRounded = !!data && data.length >= 1 ? Math.floor(parseFloat(data[data.length - 1].priceUsd)) : null;

  const { min: minValue, max: maxValue } = getMinMax(data);

  const { minLabel, maxLabel } = {
    minLabel: roundToTwoDigits(minValue, false),
    maxLabel: roundToTwoDigits(maxValue, true)
  }

  //TODO: check for gaps in data time, fix graph if needed 

  return (
    <section className="p-4">
      <div className="h-64 flex flex-col items-center justify-center space-y-2">

        <h2 className="text-xl font-semibold">BTC</h2>
        <h2 className="text-xl font-semibold">{prevCloseRoundedTwoDigits} $</h2>
        <div className="">PnL: +12 $</div>

        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              height={400}
              data={data}
              margin={{
                top: 10,
              }}
              onMouseMove={(state) => {
                const hoveredIndex = Number(state.activeIndex);
                const hoveredDataPoint = data[hoveredIndex];
                const asFloat = parseFloat(hoveredDataPoint?.priceUsd);
                if (!isNaN(asFloat)) {
                  setHighlightedValue(Math.round(asFloat));
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
                  y={prevCloseRounded}
                  stroke="var(--color-graph-stroke)"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  label={({ viewBox }) => {
                    const { x, y, width } = viewBox;
                    return (
                      <g>
                        <rect
                          x={width - charWidth * 10}
                          y={y - 12}
                          width={100}
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
                    )
                  }}
                />
              )}

              <YAxis
                orientation="right"
                tickLine={false}
                axisLine={false}
                interval={0}
                ticks={getTicks(minLabel, maxLabel, prevCloseRounded, currentRounded, highlightedValue)}
                tick={({ x, y, payload }) => {
                  //console.log("called for " + payload.value + ", priceUsd in 0:" + data[0].priceUsd)
                  let textColor = "var(--color-graph-label-text)";
                  let backgroundColor = "var(--color-graph-label-bg)";
                  let zIndex = 0;

                  const width = (maxLabel + "").length * charWidth;
                  if (prevCloseRounded && payload.value === prevCloseRounded) {
                    textColor = "var(--color-graph-label-bg)";
                    backgroundColor = "var(--color-graph-label-bg-prevclose)";
                    zIndex = 1;
                  }

                  if (currentRounded && payload.value === currentRounded) {
                    textColor = "var(--color-graph-label-bg)";
                    backgroundColor = "var(--color-graph-label-text)";
                    zIndex = 1;
                  }

                  if (highlightedValue !== null && payload.value === highlightedValue) {
                    textColor = "var(--color-graph-label-bg)";
                    backgroundColor = "var(--color-graph-label-text)";
                    zIndex = 2;
                  }

                  return (
                    <g z-index={zIndex}>
                      <rect
                        x={x}
                        y={y - 12}
                        width={paddingLabel + width + paddingLabel}
                        height={16}
                        fill={backgroundColor}
                        rx={4}
                        ry={4}
                      />
                      <text
                        x={x + paddingLabel}
                        y={y}
                        fill={textColor}
                        fontSize={10}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}

              />
              <Area
                type="linear"
                name=""
                dataKey="priceUsd"
                stroke="#287878"
                strokeWidth={2}
                fill="url(#colorUv)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section >
  );
}