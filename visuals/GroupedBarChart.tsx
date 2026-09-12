import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, BandAxis } from '../primitives/Axis';
import { scaleBand } from '../../lib/scales/band';
import { buildYScale, MARGIN } from '../../lib/chart/chartData';
import { scaleOrdinal } from '../../lib/color';
import { ChartLegend } from '../primitives/Legend';
import { useHoverState, ChartTooltip } from '../primitives/Tooltip';
import { formatValue, type ValueFormat } from '../../lib/format';

export interface GroupedRow {
  category: string;
  values: Record<string, number>;
}

export function GroupedBarChart({
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
  const allValues = rows.flatMap((r) => seriesKeys.map((k) => r.values[k] ?? 0));
  const { hovered, onHover, onLeave } = useHoverState<{ category: string; key: string; value: number }>();

  return (
    <>
      <ResponsiveSvg>
        {({ width, height }) => {
          const innerW = width - MARGIN.left - MARGIN.right;
          const innerH = height - MARGIN.top - MARGIN.bottom;
          const outer = scaleBand(rows.map((r) => r.category), [0, innerW], { paddingInner: 0.4, paddingOuter: 0.15 });
          const inner = scaleBand(seriesKeys, [0, outer.bandwidth], { paddingInner: 0.15, paddingOuter: 0 });
          const yScale = buildYScale(allValues, [innerH, 0]);
          const zeroY = yScale(0);

          return (
            <>
              <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                <NumericAxis scale={yScale} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
                <BandAxis scale={outer} offset={innerH} />
                {rows.map((row) =>
                  seriesKeys.map((key) => {
                    const value = row.values[key] ?? 0;
                    const gx = (outer(row.category) ?? 0) + (inner(key) ?? 0);
                    const barY = Math.min(yScale(value), zeroY);
                    const barH = Math.abs(yScale(value) - zeroY);
                    return (
                      <rect
                        key={`${row.category}-${key}`}
                        x={gx}
                        y={barY}
                        width={inner.bandwidth}
                        height={Math.max(barH, 1)}
                        rx={3}
                        fill={colorOf(key)}
                        onMouseEnter={() => onHover({ category: row.category, key, value }, gx + inner.bandwidth / 2, barY)}
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
