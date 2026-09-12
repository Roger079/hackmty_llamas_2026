import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis } from '../primitives/Axis';
import { scaleBand } from '../../lib/scales/band';
import { buildYScale } from '../../lib/chart/chartData';
import { colorForSign } from '../../lib/color';
import { color } from '../../theme/tokens';
import { useHoverState, ChartTooltip } from '../primitives/Tooltip';
import { formatValue, type ValueFormat } from '../../lib/format';
import { measureTextWidth } from '../../lib/textMeasure';
import type { BarDatum } from './BarChart';

export function BarHorizontalChart({
  data,
  valueFormat = 'currency',
  currency = 'MXN',
  colorBySign = false,
  colorPositive,
  colorNegative,
}: {
  data: BarDatum[];
  valueFormat?: ValueFormat;
  currency?: string;
  colorBySign?: boolean;
  colorPositive?: string;
  colorNegative?: string;
}) {
  const sorted = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const labelWidth = Math.min(160, Math.max(60, ...sorted.map((d) => measureTextWidth(d.category, 12) + 16)));
  const margin = { top: 8, right: 24, bottom: 28, left: labelWidth };
  const { hovered, onHover, onLeave } = useHoverState<BarDatum>();

  return (
    <ResponsiveSvg height={Math.max(220, sorted.length * 34 + 40)}>
      {({ width, height }) => {
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;
        const yScale = scaleBand(sorted.map((d) => d.category), [0, innerH], { paddingInner: 0.35, paddingOuter: 0.1 });
        const xScale = buildYScale(sorted.map((d) => d.value), [0, innerW]); // reused linear scale, just horizontal
        const zeroX = xScale(0);

        return (
          <>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {sorted.map((d) => {
                const barY = yScale(d.category) ?? 0;
                const vx = xScale(d.value);
                const barX = Math.min(vx, zeroX);
                const barW = Math.abs(vx - zeroX);
                const fill = colorBySign ? colorForSign(d.value, colorPositive, colorNegative) : color.brand;
                return (
                  <g key={d.category}>
                    <text x={-8} y={barY + yScale.bandwidth / 2} dy="0.32em" textAnchor="end" fontSize={12} fill="var(--bnt-text-secondary)">
                      {d.category}
                    </text>
                    <rect
                      x={barX}
                      y={barY}
                      width={Math.max(barW, 1)}
                      height={yScale.bandwidth}
                      rx={4}
                      fill={fill}
                      opacity={hovered?.datum === d ? 1 : 0.9}
                      onMouseEnter={() => onHover(d, vx, barY + yScale.bandwidth / 2)}
                      onMouseLeave={onLeave}
                    />
                  </g>
                );
              })}
              <NumericAxis scale={xScale} orientation="bottom" length={innerW} offset={innerH} format={(v) => formatValue(v, valueFormat, currency)} />
            </g>
            {hovered && (
              <foreignObject x={0} y={0} width={width} height={height} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <ChartTooltip containerSize={{ width, height }} anchor={{ x: hovered.x + margin.left, y: hovered.y + margin.top }}>
                  <div style={{ fontWeight: 600 }}>{hovered.datum.category}</div>
                  <div>{formatValue(hovered.datum.value, valueFormat, currency)}</div>
                </ChartTooltip>
              </foreignObject>
            )}
          </>
        );
      }}
    </ResponsiveSvg>
  );
}
