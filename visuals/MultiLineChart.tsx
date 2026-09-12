import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, TimeAxis, BandAxis } from '../primitives/Axis';
import { lineGenerator } from '../../lib/path/line';
import { buildXScale, buildYScale, extractXY, MARGIN, type XYPoint } from '../../lib/chart/chartData';
import { scaleOrdinal } from '../../lib/color';
import { ChartLegend } from '../primitives/Legend';
import { useHoverState, ChartTooltip } from '../primitives/Tooltip';
import { formatValue, type ValueFormat } from '../../lib/format';

export interface NamedSeries {
  key: string;
  name: string;
  rows: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
  dashed?: boolean; // used for benchmark overlays
}

export function MultiLineChart({ series, valueFormat = 'number', currency = 'MXN' }: { series: NamedSeries[]; valueFormat?: ValueFormat; currency?: string }) {
  const colorOf = scaleOrdinal(series.map((s) => s.key));
  const allPointsBySeries = series.map((s) => extractXY(s.rows, s.xKey, s.yKey));
  const allPoints = allPointsBySeries.flat();
  const allValues = allPoints.map((p) => p.y);
  const { hovered, onHover, onLeave } = useHoverState<{ p: XYPoint; seriesName: string; c: string }>();

  return (
    <>
      <ResponsiveSvg>
        {({ width, height }) => {
          const innerW = width - MARGIN.left - MARGIN.right;
          const innerH = height - MARGIN.top - MARGIN.bottom;
          const x = buildXScale(allPoints, [0, innerW]);
          const y = buildYScale(allValues, [innerH, 0]);

          return (
            <>
              <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                <NumericAxis scale={y} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
                {x.kind === 'time' ? <TimeAxis scale={x.scale} offset={innerH} /> : <BandAxis scale={x.scale} offset={innerH} />}
                {series.map((s, si) => {
                  const pts = allPointsBySeries[si];
                  const c = s.color ?? colorOf(s.key);
                  const d = lineGenerator(pts.map((p) => [x.toX(p), y(p.y)]), 'monotone');
                  return (
                    <g key={s.key}>
                      <path d={d} fill="none" stroke={c} strokeWidth={2.25} strokeDasharray={s.dashed ? '5 4' : undefined} />
                      {pts.map((p, i) => (
                        <circle
                          key={i}
                          cx={x.toX(p)}
                          cy={y(p.y)}
                          r={3}
                          fill={c}
                          stroke="white"
                          strokeWidth={1}
                          onMouseEnter={() => onHover({ p, seriesName: s.name, c }, x.toX(p), y(p.y))}
                          onMouseLeave={onLeave}
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
              {hovered && (
                <foreignObject x={0} y={0} width={width} height={height} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                  <ChartTooltip containerSize={{ width, height }} anchor={{ x: hovered.x + MARGIN.left, y: hovered.y + MARGIN.top }}>
                    <div style={{ fontWeight: 600 }}>{hovered.datum.seriesName}</div>
                    <div>{formatValue(hovered.datum.p.y, valueFormat, currency)} · {String(hovered.datum.p.x)}</div>
                  </ChartTooltip>
                </foreignObject>
              )}
            </>
          );
        }}
      </ResponsiveSvg>
      <ChartLegend items={series.map((s) => ({ key: s.key, label: s.name, color: s.color ?? colorOf(s.key) }))} />
    </>
  );
}
