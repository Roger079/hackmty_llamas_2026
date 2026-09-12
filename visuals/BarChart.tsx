import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, BandAxis } from '../primitives/Axis';
import { scaleBand } from '../../lib/scales/band';
import { buildYScale, MARGIN } from '../../lib/chart/chartData';
import { colorForSign, scaleOrdinal } from '../../lib/color';
import { useHoverState, ChartTooltip } from '../primitives/Tooltip';
import { formatValue, type ValueFormat } from '../../lib/format';

export interface BarDatum {
  category: string;
  value: number;
}

export function BarChart({
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
  const colorOf = scaleOrdinal(data.map((d) => d.category));
  const { hovered, onHover, onLeave } = useHoverState<BarDatum>();

  return (
    <ResponsiveSvg>
      {({ width, height }) => {
        const innerW = width - MARGIN.left - MARGIN.right;
        const innerH = height - MARGIN.top - MARGIN.bottom;
        const xScale = scaleBand(data.map((d) => d.category), [0, innerW], { paddingInner: 0.35, paddingOuter: 0.15 });
        const yScale = buildYScale(data.map((d) => d.value), [innerH, 0]);
        const zeroY = yScale(0);

        return (
          <>
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              <NumericAxis scale={yScale} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
              <BandAxis scale={xScale} offset={innerH} rotateLabels={data.length > 6} />
              {data.map((d) => {
                const barX = xScale(d.category) ?? 0;
                const barY = Math.min(yScale(d.value), zeroY);
                const barH = Math.abs(yScale(d.value) - zeroY);
                const fill = colorBySign ? colorForSign(d.value, colorPositive, colorNegative) : colorOf(d.category);
                return (
                  <rect
                    key={d.category}
                    x={barX}
                    y={barY}
                    width={xScale.bandwidth}
                    height={Math.max(barH, 1)}
                    rx={4}
                    fill={fill}
                    opacity={hovered?.datum === d ? 1 : 0.9}
                    onMouseEnter={() => onHover(d, barX + xScale.bandwidth / 2, barY)}
                    onMouseLeave={onLeave}
                  />
                );
              })}
            </g>
            {hovered && (
              <foreignObject x={0} y={0} width={width} height={height} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <ChartTooltip containerSize={{ width, height }} anchor={{ x: hovered.x + MARGIN.left, y: hovered.y + MARGIN.top }}>
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
