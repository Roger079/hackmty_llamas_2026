import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, TimeAxis, BandAxis } from '../primitives/Axis';
import { lineGenerator } from '../../lib/path/line';
import { areaGenerator } from '../../lib/path/area';
import { buildXScale, buildYScale, extractXY, MARGIN, type XYPoint } from '../../lib/chart/chartData';
import { scaleOrdinal } from '../../lib/color';
import { ChartLegend } from '../primitives/Legend';
import { formatValue, type ValueFormat } from '../../lib/format';

export interface ScenarioSeries {
  key: string;
  name: string;
  rows: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  confidenceLowKey?: string;
  confidenceHighKey?: string;
  color?: string;
}

/** filled=true renders each scenario as an area (simulación de crecimiento); false renders as lines (escenarios de retiro). */
export function ProjectionChart({ scenarios, filled = false, valueFormat = 'currency', currency = 'MXN' }: {
  scenarios: ScenarioSeries[];
  filled?: boolean;
  valueFormat?: ValueFormat;
  currency?: string;
}) {
  const colorOf = scaleOrdinal(scenarios.map((s) => s.key));
  const pointsBySeries = scenarios.map((s) => extractXY(s.rows, s.xKey, s.yKey));
  const allPoints = pointsBySeries.flat();
  const allValues = scenarios.flatMap((s, i) =>
    s.confidenceHighKey ? s.rows.map((r) => Number(r[s.confidenceHighKey!] ?? 0)) : pointsBySeries[i].map((p) => p.y)
  );

  return (
    <>
      <ResponsiveSvg height={320}>
        {({ width, height }) => {
          const innerW = width - MARGIN.left - MARGIN.right;
          const innerH = height - MARGIN.top - MARGIN.bottom;
          const x = buildXScale(allPoints, [0, innerW]);
          const y = buildYScale(allValues, [innerH, 0]);

          return (
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              <NumericAxis scale={y} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
              {x.kind === 'time' ? <TimeAxis scale={x.scale} offset={innerH} /> : <BandAxis scale={x.scale} offset={innerH} />}

              {scenarios.map((s, si) => {
                const pts = pointsBySeries[si];
                const c = s.color ?? colorOf(s.key);
                const linePath = lineGenerator(pts.map((p) => [x.toX(p), y(p.y)]), 'monotone');

                const band =
                  s.confidenceLowKey && s.confidenceHighKey
                    ? s.rows.map((row, i) => ({
                        xPx: x.toX(pts[i]),
                        loY: y(Number(row[s.confidenceLowKey!] ?? 0)),
                        hiY: y(Number(row[s.confidenceHighKey!] ?? 0)),
                      }))
                    : null;

                const bandPath = band
                  ? areaGenerator(
                      band.map((b) => [b.xPx, b.hiY]),
                      band.map((b) => [b.xPx, b.loY]),
                      'monotone'
                    )
                  : null;

                const fillPath = filled ? areaGenerator(pts.map((p) => [x.toX(p), y(p.y)]), innerH, 'monotone') : null;

                return (
                  <g key={s.key}>
                    {bandPath && <path d={bandPath} fill={c} opacity={0.12} stroke="none" />}
                    {fillPath && <path d={fillPath} fill={c} opacity={0.16} stroke="none" />}
                    <path d={linePath} fill="none" stroke={c} strokeWidth={2.25} />
                  </g>
                );
              })}
            </g>
          );
        }}
      </ResponsiveSvg>
      <ChartLegend items={scenarios.map((s) => ({ key: s.key, label: s.name, color: s.color ?? colorOf(s.key) }))} />
    </>
  );
}
