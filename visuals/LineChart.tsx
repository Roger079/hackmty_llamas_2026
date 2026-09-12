import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, TimeAxis, BandAxis } from '../primitives/Axis';
import { lineGenerator } from '../../lib/path/line';
import { buildXScale, buildYScale, extractXY, MARGIN, type XYPoint } from '../../lib/chart/chartData';
import { color } from '../../theme/tokens';
import { useHoverState, ChartTooltip } from '../primitives/Tooltip';
import { formatValue, type ValueFormat } from '../../lib/format';

export interface LineChartProps {
  rows: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  valueFormat?: ValueFormat;
  currency?: string;
  strokeColor?: string;
}

export function LineChart({ rows, xKey, yKey, valueFormat = 'number', currency = 'MXN', strokeColor = color.brand }: LineChartProps) {
  const points = extractXY(rows, xKey, yKey);
  const { hovered, onHover, onLeave } = useHoverState<XYPoint>();

  return (
    <ResponsiveSvg>
      {({ width, height }) => {
        const innerW = width - MARGIN.left - MARGIN.right;
        const innerH = height - MARGIN.top - MARGIN.bottom;
        const x = buildXScale(points, [0, innerW]);
        const y = buildYScale(points.map((p) => p.y), [innerH, 0]);
        const pathD = lineGenerator(points.map((p) => [x.toX(p), y(p.y)]), 'monotone');

        return (
          <>
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              <NumericAxis scale={y} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
              {x.kind === 'time' ? (
                <TimeAxis scale={x.scale} offset={innerH} />
              ) : (
                <BandAxis scale={x.scale} offset={innerH} rotateLabels={points.length > 8} />
              )}
              <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={x.toX(p)}
                  cy={y(p.y)}
                  r={hovered?.datum === p ? 5 : 3}
                  fill={strokeColor}
                  stroke="white"
                  strokeWidth={1.5}
                  onMouseEnter={() => onHover(p, x.toX(p), y(p.y))}
                  onMouseLeave={onLeave}
                />
              ))}
            </g>
            {hovered && (
              <foreignObject x={0} y={0} width={width} height={height} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <ChartTooltip containerSize={{ width, height }} anchor={{ x: hovered.x + MARGIN.left, y: hovered.y + MARGIN.top }}>
                  <div style={{ fontWeight: 600 }}>{String(hovered.datum.x)}</div>
                  <div>{formatValue(hovered.datum.y, valueFormat, currency)}</div>
                </ChartTooltip>
              </foreignObject>
            )}
          </>
        );
      }}
    </ResponsiveSvg>
  );
}
