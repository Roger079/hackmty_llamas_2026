import React from 'react';
import { ResponsiveSvg } from '../primitives/ResponsiveContainer';
import { NumericAxis, TimeAxis, BandAxis } from '../primitives/Axis';
import { lineGenerator } from '../../lib/path/line';
import { areaGenerator } from '../../lib/path/area';
import { buildXScale, buildYScale, extractXY, MARGIN } from '../../lib/chart/chartData';
import { color } from '../../theme/tokens';
import { formatValue, type ValueFormat } from '../../lib/format';

export function AreaChart({
  rows,
  xKey,
  yKey,
  valueFormat = 'currency',
  currency = 'MXN',
  fillColor = color.brand,
}: {
  rows: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  valueFormat?: ValueFormat;
  currency?: string;
  fillColor?: string;
}) {
  const points = extractXY(rows, xKey, yKey);

  return (
    <ResponsiveSvg>
      {({ width, height }) => {
        const innerW = width - MARGIN.left - MARGIN.right;
        const innerH = height - MARGIN.top - MARGIN.bottom;
        const x = buildXScale(points, [0, innerW]);
        const y = buildYScale(points.map((p) => p.y), [innerH, 0]);
        const pixelPoints: [number, number][] = points.map((p) => [x.toX(p), y(p.y)]);
        const areaD = areaGenerator(pixelPoints, y(0), 'monotone');
        const lineD = lineGenerator(pixelPoints, 'monotone');
        const gradientId = 'bnt-area-gradient';

        return (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity={0.28} />
                <stop offset="100%" stopColor={fillColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <NumericAxis scale={y} orientation="left" length={innerH} offset={0} showGrid gridLength={innerW} format={(v) => formatValue(v, valueFormat, currency)} />
            {x.kind === 'time' ? <TimeAxis scale={x.scale} offset={innerH} /> : <BandAxis scale={x.scale} offset={innerH} />}
            <path d={areaD} fill={`url(#${gradientId})`} stroke="none" />
            <path d={lineD} fill="none" stroke={fillColor} strokeWidth={2.5} />
          </g>
        );
      }}
    </ResponsiveSvg>
  );
}
