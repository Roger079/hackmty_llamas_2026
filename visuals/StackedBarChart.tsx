import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, BandAxis } from '../primitives/Axis';
import { scaleBand } from '../../lib/scales/band';
import { scaleLinear } from '../../lib/scales/linear';
import { stackLayout, stackTotals } from '../../lib/stack';
import { MARGIN } from '../../lib/chart/chartData';
import { scaleOrdinal } from '../../lib/color';
import { ChartLegend } from '../primitives/Legend';
import { useHoverState, ChartTooltip } from '../primitives/Tooltip';
import { formatValue, type ValueFormat } from '../../lib/format';
import type { GroupedRow } from './GroupedBarChart';

export function StackedBarChart({
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
  const { hovered, onHover, onLeave } = useHoverState<{ category: string; key: string; value: number }>();

  return (
    <>
      <ResponsiveSvg>
        {({ width, height }) => {
          const innerW = width - MARGIN.left - MARGIN.right;
          const innerH = height - MARGIN.top - MARGIN.bottom;
          const xScale = scaleBand(rows.map((r) => r.category), [0, innerW], { paddingInner: 0.35, paddingOuter: 0.15 });
          const yScale = scaleLinear([0, maxTotal], [innerH, 0]);

          return (
            <>
              <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                <NumericAxis scale={yScale} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
                <BandAxis scale={xScale} offset={innerH} />
                {seriesKeys.map((key, seriesIdx) =>
                  bandsBySeries[seriesIdx].map((band) => {
                    const barX = xScale(band.category) ?? 0;
                    const barY = yScale(band.y1);
                    const barH = yScale(band.y0) - yScale(band.y1);
                    return (
                      <rect
                        key={`${band.category}-${key}`}
                        x={barX}
                        y={barY}
                        width={xScale.bandwidth}
                        height={Math.max(barH, 0)}
                        fill={colorOf(key)}
                        onMouseEnter={() => onHover({ category: band.category, key, value: band.value }, barX + xScale.bandwidth / 2, barY)}
                        onMouseLeave={onLeave}
                      />
                    );
                  })
                )}
              </g>
              {hovered && (
                <foreignObject x={0} y={0} width={width} height={height} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                  <ChartTooltip containerSize={{ width, height }} anchor={{ x: hovered.x + MARGIN.left, y: hovered.y + MARGIN.top }}>
                    <div style={{ fontWeight: 600 }}>{seriesNames[hovered.datum.key] ?? hovered.datum.key} · {hovered.datum.category}</div>
                    <div>{formatValue(hovered.datum.value, valueFormat, currency)}</div>
                  </ChartTooltip>
                </foreignObject>
              )}
            </>
          );
        }}
      </ResponsiveSvg>
      <ChartLegend items={seriesKeys.map((k) => ({ key: k, label: seriesNames[k] ?? k, color: colorOf(k) }))} />
    </>
  );
}
