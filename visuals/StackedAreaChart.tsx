import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, BandAxis, TimeAxis } from '../primitives/Axis';
import { areaGenerator } from '../../lib/path/area';
import { scaleLinear } from '../../lib/scales/linear';
import { stackLayout, stackTotals } from '../../lib/stack';
import { buildXScale, MARGIN } from '../../lib/chart/chartData';
import { scaleOrdinal } from '../../lib/color';
import { ChartLegend } from '../primitives/Legend';
import { formatValue, type ValueFormat } from '../../lib/format';
import type { GroupedRow } from './GroupedBarChart';

export function StackedAreaChart({
  rows,
  seriesKeys,
  seriesNames,
  valueFormat = 'currency',
  currency = 'MXN',
}: {
  rows: GroupedRow[];
  seriesKeys: string[];
  seriesNames: Record<string, string>;
  valueFormat?: ValueFormat;
  currency?: string;
}) {
  const colorOf = scaleOrdinal(seriesKeys);
  const bandsBySeries = stackLayout(rows, seriesKeys);
  const totals = stackTotals(rows, seriesKeys);
  const maxTotal = Math.max(...totals, 1);
  const xPoints = rows.map((r) => ({ x: r.category, y: 0, raw: {} }));

  return (
    <>
      <ResponsiveSvg>
        {({ width, height }) => {
          const innerW = width - MARGIN.left - MARGIN.right;
          const innerH = height - MARGIN.top - MARGIN.bottom;
          const x = buildXScale(xPoints, [0, innerW]);
          const yScale = scaleLinear([0, maxTotal], [innerH, 0]);

          return (
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              <NumericAxis scale={yScale} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
              {x.kind === 'time' ? <TimeAxis scale={x.scale} offset={innerH} /> : <BandAxis scale={x.scale} offset={innerH} />}
              {seriesKeys.map((key, seriesIdx) => {
                const bands = bandsBySeries[seriesIdx];
                const topPoints: [number, number][] = bands.map((b, i) => [x.toX(xPoints[i]), yScale(b.y1)]);
                const bottomPoints: [number, number][] = bands.map((b, i) => [x.toX(xPoints[i]), yScale(b.y0)]);
                const d = areaGenerator(topPoints, bottomPoints, 'monotone');
                return <path key={key} d={d} fill={colorOf(key)} opacity={0.85} stroke="white" strokeWidth={0.5} />;
              })}
            </g>
          );
        }}
      </ResponsiveSvg>
      <ChartLegend items={seriesKeys.map((k) => ({ key: k, label: seriesNames[k] ?? k, color: colorOf(k) }))} />
    </>
  );
}
