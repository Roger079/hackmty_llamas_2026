import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { ChartProps, RecordRow, SeriesConfig } from './types';
import { arc, extent, format, num, palette, path, pointer, resolve, rows, scale, statusColor } from './utils';
import { InteractiveDrilldownModal } from '../components/InteractiveDrilldownModal';
import { parseMonthString } from '../utils/transactionDrilldownService';

export interface ChartDrilldownRequest {
  title: string;
  category?: string;
  date?: string;
  month?: string;
  period?: string;
  amount?: number;
  color?: string;
  subtitle?: string;
}

const margin = { top: 30, right: 20, bottom: 42, left: 58 };

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const o = new ResizeObserver(() => setW(ref.current?.clientWidth || 640));
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, w] as const;
}

const axis = (w: number, h: number, values: number[], fmt: (x: number) => string) => {
  const [lo, hi] = extent(values);
  const ticks = Array.from({ length: 5 }, (_, i) => lo + (hi - lo) * i / 4);
  return (
    <>
      {ticks.map(v => {
        const y = scale(v, [lo, hi], [h - margin.bottom, margin.top]);
        return (
          <g key={v}>
            <line x1={margin.left} x2={w - margin.right} y1={y} y2={y} stroke="#E6EDF4" />
            <text x={margin.left - 9} y={y + 4} textAnchor="end" fontSize="10" fill="#6D85A1">
              {fmt(v)}
            </text>
          </g>
        );
      })}
      <line x1={margin.left} x2={w - margin.right} y1={h - margin.bottom} y2={h - margin.bottom} stroke="#C9D7E5" />
    </>
  );
};

function pointsFor(data: RecordRow[], s: SeriesConfig, i: number, w: number, h: number, all: number[]) {
  const xk = s.xKey || 'x', yk = s.yKey || 'y', [lo, hi] = extent(all);
  return data.map((d, j) => ({
    d,
    x: scale(j, [0, Math.max(data.length - 1, 1)], [margin.left, w - margin.right]),
    y: scale(num(d[yk]), [lo, hi], [h - margin.bottom, margin.top]),
    v: num(d[yk]),
    label: String(d[xk] ?? j),
    color: s.color || palette[i % palette.length]
  }));
}

function Cartesian({
  p,
  w,
  h,
  data,
  series,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  data: RecordRow[];
  series: SeriesConfig[];
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  const rawData = data.length ? data : rows(p.data, p.dataPath);
  const firstRow = rawData[0] || {};
  const catKey = p.categoryKey || Object.keys(firstRow).find(k => typeof firstRow[k] === 'string' && !['color', 'status'].includes(k)) || 'label';

  if (!series.length) {
    const numKeys = Object.keys(firstRow).filter(k => k !== catKey && (typeof firstRow[k] === 'number' || (!isNaN(Number(firstRow[k])) && firstRow[k] !== '')));
    if (numKeys.length > 1) {
      series = numKeys.map((k, idx) => ({
        dataPath: p.dataPath || '',
        xKey: catKey,
        yKey: k,
        name: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        color: palette[idx % palette.length]
      }));
    } else {
      series = [{ dataPath: p.dataPath || '', xKey: catKey, yKey: p.valueKey || numKeys[0] || 'value', color: palette[0] }];
    }
  }

  const source = series.map(s => {
    const r = rows(p.data, s.dataPath);
    return r.length ? r : rawData;
  });

  const main = source[0]?.length ? source[0] : rawData;
  const count = Math.max(main.length, 1);
  const isStacked = p.chartType === 'stackedBar' || p.chartType === 'stackedArea';
  const isGrouped = p.chartType === 'groupedBar' || (p.chartType === 'bar' && series.length > 1);
  const isBarFamily = ['bar', 'groupedBar', 'stackedBar', 'waterfall', 'histogram'].includes(p.chartType);

  const singleValues: number[] = source.flatMap((d, i) => d.map(r => num(r[series[i]?.yKey || p.valueKey || 'value'])));
  const stackedSums: number[] = main.map((_, i) => series.reduce((sum, s, k) => sum + Math.max(0, num((source[k]?.[i] || main[i])?.[s.yKey || p.valueKey || 'value'])), 0));
  const allValues = isStacked ? [...singleValues, ...stackedSums] : singleValues;
  const [lo, hi] = extent(allValues.length ? allValues : [0, 100]);

  const y = (v: number) => scale(v, [Math.min(0, lo), Math.max(hi, 1)], [h - margin.bottom, margin.top]);
  const x = (i: number) => scale(i, [0, Math.max(count - 1, 1)], [margin.left, w - margin.right]);
  const slotW = (w - margin.left - margin.right) / count;
  const barCenterX = (i: number) => margin.left + (i + 0.5) * slotW;
  const bw = slotW * 0.62;

  const marks = p.chartType === 'barHorizontal' ? main.map((d, i) => {
    const v = num(d[p.valueKey || series[0]?.yKey || 'value']);
    const yy = margin.top + i * (h - margin.top - margin.bottom) / count;
    const barColor = v < 0 ? p.colorNegative || '#C7354F' : p.colorPositive || '#E4003B';
    const labelStr = String(d[catKey] ?? '');
    const barMonth = parseMonthString(labelStr) || chartMonth;
    return (
      <g
        key={i}
        className="group cursor-pointer"
        onClick={() => onDrilldown?.({
          title: labelStr || 'Detalle de Movimiento',
          category: labelStr,
          amount: Math.abs(v),
          color: barColor,
          month: barMonth,
          subtitle: `Gastos correspondientes a ${labelStr}`,
        })}
      >
        <text x={margin.left - 7} y={yy + 15} textAnchor="end" fontSize="10" fill="#526B87" fontWeight="600" className="group-hover:fill-[#EB0029] transition-colors">
          {labelStr}
        </text>
        <rect
          x={margin.left}
          y={yy}
          width={scale(v, [0, Math.max(hi, 1)], [0, w - margin.left - margin.right])}
          height={Math.max(8, (h - margin.top - margin.bottom) / count - 8)}
          rx="5"
          fill={barColor}
          className="transition-all duration-150 group-hover:opacity-85 group-hover:brightness-110 group-hover:scale-x-[1.01]"
        >
          <title>{`${labelStr}: ${format(v, p.valueFormat, p.currency)}`}</title>
        </rect>
      </g>
    );
  }) : isBarFamily ? main.flatMap((d, i) => {
    const vals = (isGrouped || isStacked)
      ? series.map((s, k) => num((source[k]?.[i] || d)?.[s.yKey || p.valueKey || 'value']))
      : [num(d[p.valueKey || series[0]?.yKey || 'value'])];
    let base = 0;
    const centerX = barCenterX(i);
    return vals.map((v, k) => {
      const barW = isGrouped ? Math.max(bw / vals.length - 2, 4) : bw;
      const xx = isGrouped ? (centerX - bw / 2 + (bw / vals.length) * k) : (centerX - bw / 2);
      const yy = isStacked ? y(base + Math.max(v, 0)) : y(Math.max(v, 0));
      const hh = isStacked ? Math.abs(y(base) - y(base + v)) : Math.abs(y(0) - y(v));
      if (isStacked) base += Math.max(0, v);
      const barColor = String(
        (isGrouped || isStacked)
          ? (series[k]?.color || palette[k % palette.length])
          : (d.color || series[0]?.color || palette[i % palette.length])
      );
      const barTitle = String(resolve(series[k]?.name, p.data) || d[catKey] || 'Valor');
      const rawCatStr = String(d[catKey] || barTitle);
      const barMonth = parseMonthString(rawCatStr) || chartMonth;

      return (
        <rect
          key={`${i}-${k}`}
          x={xx}
          y={yy}
          width={barW}
          height={Math.max(hh, 2)}
          rx="3"
          fill={barColor}
          className="transition-all duration-150 hover:opacity-85 hover:brightness-110 hover:scale-y-[1.02] cursor-pointer"
          style={{ transformOrigin: `${xx + barW / 2}px ${yy + hh}px` }}
          onClick={() => onDrilldown?.({
            title: barTitle,
            category: rawCatStr,
            amount: Math.abs(v),
            color: barColor,
            month: barMonth,
            subtitle: `Total registrado: ${format(v, p.valueFormat, p.currency)}`,
          })}
        >
          <title>{`${barTitle}: ${format(v, p.valueFormat, p.currency)}`}</title>
        </rect>
      );
    });
  }) : series.map((s, i) => {
    const pts = pointsFor(source[i] || main, s, i, w, h, allValues);
    const last = pts[pts.length - 1];
    const d = path(pts.map(q => [q.x, q.y]));
    const fill = p.chartType.includes('area') ? `${d} L${last?.x},${h - margin.bottom} L${pts[0]?.x},${h - margin.bottom} Z` : undefined;
    return (
      <g key={i}>
        {fill && <path d={fill} fill={pts[0]?.color} opacity=".14" />}
        <path d={d} fill="none" stroke={pts[0]?.color} strokeWidth="2.5" />
        {pts.map((q, j) => {
          const ptTitle = `${String(resolve(s.name, p.data) || 'Registro')}: ${q.label}`;
          const ptMonth = parseMonthString(q.label) || chartMonth;
          return (
            <circle
              key={j}
              cx={q.x}
              cy={q.y}
              r="3.5"
              fill="#fff"
              stroke={q.color}
              strokeWidth="2"
              className="cursor-pointer hover:r-5 transition-all"
              onClick={() => onDrilldown?.({
                title: ptTitle,
                category: q.label,
                amount: Math.abs(q.v),
                color: q.color,
                month: ptMonth,
              })}
            >
              <title>{`${q.label}: ${format(q.v, p.valueFormat, p.currency)}`}</title>
            </circle>
          );
        })}
      </g>
    );
  });

  return (
    <>
      <g>{axis(w, h, allValues, v => format(v, p.valueFormat, p.currency))}</g>
      {marks}
      <g>
        {main.map((d, i) => (
          <text key={i} x={isBarFamily ? barCenterX(i) : x(i)} y={h - 15} textAnchor="middle" fontSize="10" fill="#6D85A1" fontWeight="600">
            {String(d[catKey] ?? '').slice(0, 12)}
          </text>
        ))}
      </g>
    </>
  );
}

function Radial({
  p,
  w,
  h,
  data,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  data: RecordRow[];
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 30;
  const vals: number[] = data.map(d => num(d[p.valueKey || 'value']));
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  let angle = -Math.PI / 2;

  return (
    <>
      {data.map((d, i) => {
        const next = angle + Math.max(0, vals[i]) / total * Math.PI * 2;
        const catName = String(d[p.categoryKey || 'label'] || d['name'] || `Categoría ${i + 1}`);
        const sliceColor = palette[i % palette.length];
        const pct = Math.round((vals[i] / total) * 100);
        const out = (
          <path
            key={i}
            d={arc(cx, cy, r, angle, next, p.chartType === 'donut' ? r * 0.6 : 0)}
            fill={sliceColor}
            stroke="#FFFFFF"
            strokeWidth="2"
            className="transition-all duration-200 hover:opacity-90 hover:brightness-105 cursor-pointer hover:scale-102"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            onClick={() => {
              if (p.action) p.onAction?.(p.action.event, d);
              onDrilldown?.({
                title: catName,
                category: catName,
                amount: vals[i],
                color: sliceColor,
                month: chartMonth,
                subtitle: `${pct}% del total registrado`,
              });
            }}
          >
            <title>{`${catName}: ${format(vals[i], p.valueFormat || 'currency', p.currency || 'MXN')} (${pct}%)`}</title>
          </path>
        );
        angle = next;
        return out;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="#6D85A1" fontWeight="600">
        {p.chartType === 'donut' ? 'Total' : ''}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="18" fontWeight="700" fill="#061D3A">
        {p.chartType === 'donut' ? format(total, p.valueFormat, p.currency) : ''}
      </text>
    </>
  );
}

function Gauge({ p, w, h }: { p: ChartProps; w: number; h: number }) {
  const min = num(resolve(p.gaugeMin, p.data)), max = num(resolve(p.gaugeMax, p.data), 100), value = num(resolve(p.gaugeValue, p.data));
  const cx = w / 2, cy = h * 0.76, r = Math.min(w * 0.38, h * 0.62), ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const bands = p.thresholds || [{ from: min, to: max, status: 'neutral' } as any];
  return (
    <>
      {bands.map((b, i) => {
        const from = num(resolve(b.from, p.data)), to = num(resolve(b.to, p.data));
        return (
          <path
            key={i}
            d={arc(cx, cy, r, Math.PI + Math.PI * (from - min) / (max - min || 1), Math.PI + Math.PI * (to - min) / (max - min || 1), r - 15)}
            fill={statusColor[(b.status || 'neutral') as keyof typeof statusColor]}
          />
        );
      })}
      <line x1={cx} y1={cy} x2={cx + r * 0.78 * Math.cos(Math.PI + Math.PI * ratio)} y2={cy + r * 0.78 * Math.sin(Math.PI + Math.PI * ratio)} stroke="#061D3A" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="6" fill="#061D3A" />
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="22" fontWeight="700" fill="#061D3A">
        {format(value, p.valueFormat, p.currency)}
      </text>
    </>
  );
}

function toSafeArray<T>(...candidates: unknown[]): T[] {
  for (const item of candidates) {
    if (Array.isArray(item)) return item as T[];
  }
  return [];
}

function SankeyDiagram({
  p,
  w,
  h,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  const nodeFromPointer = p.sankeyNodesPath ? pointer(p.data, p.sankeyNodesPath) : undefined;
  const linkFromPointer = p.sankeyLinksPath ? pointer(p.data, p.sankeyLinksPath) : undefined;

  const rawNodesInput = toSafeArray<Record<string, unknown>>(
    nodeFromPointer,
    p.data && typeof p.data === 'object' ? (p.data as any).nodes : undefined,
    (p as any).nodes
  );
  const rawLinksInput = toSafeArray<Record<string, unknown>>(
    linkFromPointer,
    p.data && typeof p.data === 'object' ? (p.data as any).links : undefined,
    (p as any).links
  );

  let nodes: Array<{ id: string; label: string; color?: string }> = rawNodesInput.map((node: any, index) => ({
    id: String(node?.id ?? node?.name ?? `node_${index}`),
    label: String(node?.label ?? node?.name ?? node?.id ?? `Categoría ${index + 1}`),
    color: node?.color,
  }));
  let links: Array<{ source: string; target: string; value: number; color?: string }> = rawLinksInput
    .filter((link: any) => link && link.source != null && link.target != null)
    .map((link: any) => ({
      source: String(link.source),
      target: String(link.target),
      value: num(link.value),
      color: link.color,
    }));

  if (!links.length) {
    const list = rows(p.data, p.dataPath);
    if (list.length > 0) {
      const valKey = p.valueKey || Object.keys(list[0]).find(k => typeof list[0][k] === 'number') || 'amount';
      const catKey = p.categoryKey || Object.keys(list[0]).find(k => typeof list[0][k] === 'string' && !['color', 'status'].includes(k)) || 'name';
      const sourceId = 'ingresos';
      nodes = [
        { id: sourceId, label: 'Nómina / Ingresos', color: '#0A5CA8' },
        ...list.map((item, idx) => ({
          id: `node_${idx}`,
          label: String(item[catKey] || `Categoría ${idx + 1}`),
          color: palette[idx % palette.length]
        }))
      ];
      links = list.map((item, idx) => ({
        source: sourceId,
        target: `node_${idx}`,
        value: num(item[valKey])
      }));
    }
  }

  if (!nodes.length && links.length > 0) {
    const idSet = new Set<string>();
    links.forEach((l) => {
      if (l.source) idSet.add(String(l.source));
      if (l.target) idSet.add(String(l.target));
    });
    nodes = Array.from(idSet).map((id, idx) => ({
      id,
      label: id,
      color: palette[idx % palette.length],
    }));
  }

  if (!nodes.length || !links.length) {
    return (
      <text x={w / 2} y={h / 2} textAnchor="middle" fill="#6D85A1" fontSize="13" fontWeight="600">
        Sin datos disponibles para diagrama de flujo
      </text>
    );
  }

  const nodeMap = new Map<string, {
    id: string;
    label: string;
    color: string;
    inLinks: typeof links;
    outLinks: typeof links;
    column: number;
    value: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }>();

  nodes.forEach((n, idx) => {
    nodeMap.set(n.id, {
      id: n.id,
      label: n.label || n.id,
      color: n.color || palette[idx % palette.length],
      inLinks: [],
      outLinks: [],
      column: 0,
      value: 0,
      x: 0,
      y: 0,
      w: 16,
      h: 20
    });
  });

  links.forEach(l => {
    const src = nodeMap.get(l.source);
    const tgt = nodeMap.get(l.target);
    if (src && tgt) {
      src.outLinks.push(l);
      tgt.inLinks.push(l);
    }
  });

  nodeMap.forEach(n => {
    const inSum = n.inLinks.reduce((sum, l) => sum + num(l.value), 0);
    const outSum = n.outLinks.reduce((sum, l) => sum + num(l.value), 0);
    n.value = Math.max(inSum, outSum, 1);
  });

  nodeMap.forEach(n => {
    if (n.inLinks.length === 0) {
      n.column = 0;
    }
  });

  let changed = true;
  let iters = 0;
  while (changed && iters < 10) {
    changed = false;
    iters++;
    links.forEach(l => {
      const src = nodeMap.get(l.source);
      const tgt = nodeMap.get(l.target);
      if (src && tgt && tgt.column <= src.column) {
        tgt.column = src.column + 1;
        changed = true;
      }
    });
  }

  const nodeArr = Array.from(nodeMap.values());
  const maxCol = Math.max(...nodeArr.map(n => n.column), 1);

  const leftPad = w < 440 ? 60 : 80;
  const rightPad = w < 440 ? 60 : 80;
  const usableW = Math.max(w - leftPad - rightPad, 120);

  const colWidth = usableW / maxCol;
  nodeArr.forEach(n => {
    n.x = leftPad + n.column * colWidth;
  });

  const columns: Array<typeof nodeArr> = Array.from({ length: maxCol + 1 }, () => []);
  nodeArr.forEach(n => columns[n.column].push(n));

  const topPad = 24;
  const botPad = 28;
  const usableH = Math.max(h - topPad - botPad, 100);

  columns.forEach(colNodes => {
    if (!colNodes.length) return;
    const colTotalVal = colNodes.reduce((sum, n) => sum + n.value, 0) || 1;
    const gap = 12;
    const totalGaps = (colNodes.length - 1) * gap;
    const availForNodes = Math.max(usableH - totalGaps, colNodes.length * 10);

    let currY = topPad;
    colNodes.forEach(n => {
      n.h = Math.max(8, (n.value / colTotalVal) * availForNodes);
      n.y = currY;
      currY += n.h + gap;
    });
  });

  const srcOffset = new Map<string, number>();
  const tgtOffset = new Map<string, number>();
  nodeArr.forEach(n => {
    srcOffset.set(n.id, 0);
    tgtOffset.set(n.id, 0);
  });

  const ribbons = links.map((l, i) => {
    const src = nodeMap.get(l.source);
    const tgt = nodeMap.get(l.target);
    if (!src || !tgt) return null;

    const val = num(l.value);
    const srcRatio = src.value > 0 ? val / src.value : 0;
    const tgtRatio = tgt.value > 0 ? val / tgt.value : 0;

    const srcH = Math.max(2, srcRatio * src.h);
    const tgtH = Math.max(2, tgtRatio * tgt.h);

    const sY0 = src.y + (srcOffset.get(src.id) || 0);
    const sY1 = sY0 + srcH;
    srcOffset.set(src.id, (srcOffset.get(src.id) || 0) + srcH);

    const tY0 = tgt.y + (tgtOffset.get(tgt.id) || 0);
    const tY1 = tY0 + tgtH;
    tgtOffset.set(tgt.id, (tgtOffset.get(tgt.id) || 0) + tgtH);

    const x0 = src.x + src.w;
    const x1 = tgt.x;
    const cx1 = x0 + (x1 - x0) * 0.5;
    const cx2 = cx1;

    const ribbonPath = `M ${x0.toFixed(1)} ${sY0.toFixed(1)} ` +
      `C ${cx1.toFixed(1)} ${sY0.toFixed(1)}, ${cx2.toFixed(1)} ${tY0.toFixed(1)}, ${x1.toFixed(1)} ${tY0.toFixed(1)} ` +
      `L ${x1.toFixed(1)} ${tY1.toFixed(1)} ` +
      `C ${cx2.toFixed(1)} ${tY1.toFixed(1)}, ${cx1.toFixed(1)} ${sY1.toFixed(1)}, ${x0.toFixed(1)} ${sY1.toFixed(1)} Z`;

    const gradId = `sankey-grad-${i}`;
    const strokeColor = l.color || src.color;

    return (
      <g key={i}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={src.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={tgt.color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d={ribbonPath}
          fill={`url(#${gradId})`}
          stroke={strokeColor}
          strokeWidth="0.5"
          strokeOpacity="0.3"
          className="transition-all duration-200 hover:opacity-90 hover:stroke-width-2 cursor-pointer filter hover:drop-shadow-sm"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            onDrilldown?.({
              title: tgt.label,
              category: tgt.label,
              amount: val,
              color: tgt.color,
              month: chartMonth,
              subtitle: `Flujo desde ${src.label}`,
            });
          }}
        >
          <title>{`Clic para auditar movimientos de ${src.label} → ${tgt.label}: ${format(val, p.valueFormat || 'currency', p.currency || 'MXN')}`}</title>
        </path>
      </g>
    );
  });

  return (
    <g>
      {ribbons}
      {nodeArr.map(n => {
        const isLeft = n.column === 0;
        const isRight = n.column === maxCol;
        const maxLen = w < 440 ? 10 : 16;
        const displayLabel = n.label.length > maxLen ? n.label.slice(0, maxLen - 1) + '…' : n.label;

        return (
          <g
            key={n.id}
            className="group cursor-pointer"
            onClick={() => {
              onDrilldown?.({
                title: n.label,
                category: n.label,
                amount: n.value,
                color: n.color,
                month: chartMonth,
                subtitle: `${n.column === 0 ? 'Nómina / Abono registrado' : 'Gasto por concepto'} (${format(n.value, p.valueFormat || 'currency', p.currency || 'MXN')})`,
              });
            }}
          >
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx="4"
              fill={n.color}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="transition-all duration-200 group-hover:scale-105 group-hover:filter group-hover:drop-shadow-md"
              style={{ transformOrigin: `${n.x + n.w / 2}px ${n.y + n.h / 2}px` }}
            >
              <title>{`Clic para ver movimientos de ${n.label}: ${format(n.value, p.valueFormat || 'currency', p.currency || 'MXN')}`}</title>
            </rect>
            {isLeft ? (
              <g>
                <text
                  x={n.x - 8}
                  y={n.y + n.h / 2 - 2}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="700"
                  fill="#061D3A"
                  className="group-hover:fill-[#EB0029] transition-colors"
                >
                  {displayLabel}
                </text>
                <text
                  x={n.x - 8}
                  y={n.y + n.h / 2 + 10}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="600"
                  fill="#EB0029"
                >
                  {format(n.value, p.valueFormat || 'currency', p.currency || 'MXN')}
                </text>
              </g>
            ) : isRight ? (
              <g>
                <text
                  x={n.x + n.w + 8}
                  y={n.y + n.h / 2 - 2}
                  textAnchor="start"
                  fontSize="10"
                  fontWeight="700"
                  fill="#061D3A"
                  className="group-hover:fill-[#EB0029] transition-colors"
                >
                  {displayLabel}
                </text>
                <text
                  x={n.x + n.w + 8}
                  y={n.y + n.h / 2 + 10}
                  textAnchor="start"
                  fontSize="9"
                  fontWeight="600"
                  fill="#526B87"
                >
                  {format(n.value, p.valueFormat || 'currency', p.currency || 'MXN')}
                </text>
              </g>
            ) : (
              <text
                x={n.x + n.w / 2}
                y={n.y - 5}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#061D3A"
                className="group-hover:fill-[#EB0029] transition-colors"
              >
                {displayLabel}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function CalendarHeatmapChart({
  p,
  w,
  h,
  data,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  data: RecordRow[];
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  const key = p.valueKey || 'value';
  const dateKey = p.dateKey || 'date';

  let items = data.length ? data : rows(p.data, p.dataPath);
  if (!items.length && (p.data as any)?.categories) {
    items = (p.data as any).categories;
  }
  if (!items.length) {
    items = Array.from({ length: 30 }, (_, i) => ({
      date: `${chartMonth}-${String(i + 1).padStart(2, '0')}`,
      value: [1, 15, 30].includes(i + 1) ? 1850 : (i % 3 === 0 ? 320 : i % 2 === 0 ? 150 : 0)
    }));
  }

  const values = items.map(d => num(d[key]));
  const maxVal = Math.max(...values, 100);

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const padX = 8;
  const availW = Math.max(w - padX * 2, 200);
  const cellGap = 5;
  const numRows = Math.max(1, Math.ceil(items.length / 7));
  const startY = 24;
  const availGridH = Math.max(h - startY - 36, 120);

  const maxCellW = Math.floor((availW - 6 * cellGap) / 7);
  const maxCellH = Math.floor((availGridH - (numRows - 1) * cellGap) / numRows);
  const cellSize = Math.max(18, Math.min(maxCellW, maxCellH, 44));

  const gridWidth = 7 * cellSize + 6 * cellGap;
  const startX = Math.max(padX, Math.floor((w - gridWidth) / 2));
  const legendY = startY + numRows * (cellSize + cellGap) + 12;

  return (
    <g>
      {dayNames.map((day, idx) => (
        <text
          key={day}
          x={startX + idx * (cellSize + cellGap) + cellSize / 2}
          y={startY - 8}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="#6D85A1"
        >
          {day}
        </text>
      ))}

      {items.map((d, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const val = num(d[key]);
        const x = startX + col * (cellSize + cellGap);
        const y = startY + row * (cellSize + cellGap);
        const intensity = val > 0 ? Math.max(0.18, Math.min(1, val / maxVal)) : 0;
        const fillColor = val === 0 ? '#F1F5F9' : '#EB0029';
        const fillOpacity = val === 0 ? 0.9 : intensity;
        const dateStr = String(d[dateKey] || `${chartMonth}-${String(i + 1).padStart(2, '0')}`);
        const cellMonth = dateStr ? dateStr.slice(0, 7) : chartMonth;

        return (
          <g
            key={i}
            className="group cursor-pointer"
            onClick={() => {
              onDrilldown?.({
                title: `Movimientos del ${dateStr}`,
                date: dateStr,
                month: cellMonth,
                category: 'Gasto Diario',
                amount: val,
                color: val > 0 ? '#EB0029' : '#64748B',
                subtitle: val > 0 ? `Total gastado en el día: ${format(val, 'currency', 'MXN')}` : 'Sin compras registradas este día',
              });
            }}
          >
            <rect
              x={x}
              y={y}
              width={cellSize}
              height={cellSize}
              rx={Math.max(3, Math.min(6, Math.floor(cellSize / 5)))}
              fill={fillColor}
              fillOpacity={fillOpacity}
              stroke={val > 0 ? '#EB0029' : '#E2E8F0'}
              strokeWidth="1"
              className="transition-all duration-150 group-hover:stroke-[#061D3A] group-hover:stroke-[2.5px] group-hover:scale-105"
              style={{ cursor: 'pointer', transformOrigin: `${x + cellSize / 2}px ${y + cellSize / 2}px` }}
            >
              <title>{`Clic para auditar movimientos del ${dateStr}: ${format(val, p.valueFormat || 'currency', p.currency || 'MXN')}`}</title>
            </rect>
            <text
              x={x + cellSize / 2}
              y={y + cellSize / 2 + 3.5}
              textAnchor="middle"
              fontSize={cellSize >= 28 ? '11' : '9'}
              fontWeight="600"
              fill={val > maxVal * 0.5 ? '#FFFFFF' : '#475569'}
              pointerEvents="none"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      <g transform={`translate(${startX}, ${Math.min(legendY, h - 14)})`}>
        <text x="0" y="9" fontSize="10" fill="#6D85A1" fontWeight="600">Menor gasto</text>
        <rect x="68" y="1" width="10" height="10" rx="2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="82" y="1" width="10" height="10" rx="2" fill="#EB0029" fillOpacity="0.25" />
        <rect x="96" y="1" width="10" height="10" rx="2" fill="#EB0029" fillOpacity="0.6" />
        <rect x="110" y="1" width="10" height="10" rx="2" fill="#EB0029" fillOpacity="1" />
        <text x="126" y="9" fontSize="10" fill="#6D85A1" fontWeight="600">Mayor gasto</text>
      </g>
    </g>
  );
}

function WaterfallChart({
  p,
  w,
  h,
  data,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  data: RecordRow[];
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  const key = p.valueKey || 'monto';
  const catKey = p.categoryKey || 'etapa';
  const items = data.length ? data : rows(p.data, p.dataPath);
  if (!items.length) return null;

  let runningTotal = 0;
  const bars = items.map((d, i) => {
    const v = num(d[key]);
    const isFirst = i === 0;
    const isLast = i === items.length - 1;
    let base = runningTotal;
    let top = runningTotal + v;
    if (isLast && v > 0) {
      base = 0;
      top = v;
    } else {
      runningTotal += v;
    }
    return {
      d,
      label: String(d[catKey] || `Etapa ${i + 1}`),
      val: v,
      base: Math.min(base, top),
      top: Math.max(base, top),
      isTotal: isFirst || isLast,
      isPositive: v >= 0
    };
  });

  const allVals = bars.flatMap(b => [b.base, b.top, 0]);
  const [lo, hi] = extent(allVals);
  const maxRange = Math.max(hi * 1.15, 1);
  const minRange = Math.min(lo < 0 ? lo * 1.15 : 0, 0);

  const count = bars.length;
  const bw = (w - margin.left - margin.right) / count * 0.65;
  const x = (i: number) => margin.left + (i + 0.5) * ((w - margin.left - margin.right) / count);
  const y = (v: number) => scale(v, [minRange, maxRange], [h - margin.bottom, margin.top]);

  return (
    <g>
      <g>{axis(w, h, [minRange, maxRange], v => format(v, p.valueFormat, p.currency))}</g>
      {bars.map((b, i) => {
        const xx = x(i) - bw / 2;
        const yTop = y(b.top);
        const yBase = y(b.base);
        const hh = Math.max(Math.abs(yBase - yTop), 3);
        const color = b.isTotal ? '#0A5CA8' : b.isPositive ? '#008A5A' : '#EB0029';

        const isNearTop = yTop - 6 < margin.top + 2;
        const labelY = (isNearTop && hh >= 18) ? yTop + 13 : Math.max(margin.top + 8, yTop - 6);
        const labelFill = (isNearTop && hh >= 18) ? '#FFFFFF' : color;

        const isFirst = i === 0;
        const isLast = i === count - 1;
        let labelX = x(i);
        let anchor: 'start' | 'middle' | 'end' = 'middle';
        if (isFirst && labelX - 25 < margin.left) {
          labelX = Math.max(xx, margin.left + 2);
          anchor = 'start';
        } else if (isLast && labelX + 25 > w - margin.right) {
          labelX = Math.min(xx + bw, w - margin.right - 2);
          anchor = 'end';
        }

        return (
          <g
            key={i}
            className="group cursor-pointer"
            onClick={() => {
              onDrilldown?.({
                title: b.label,
                category: b.label,
                amount: Math.abs(b.val),
                color: color,
                month: chartMonth,
                subtitle: b.isTotal ? 'Balance acumulado' : (b.isPositive ? 'Etapa de Abono / Nómina' : 'Etapa de Egreso / Gasto'),
              });
            }}
          >
            <rect
              x={xx}
              y={yTop}
              width={bw}
              height={hh}
              rx="4"
              fill={color}
              className="transition-all duration-150 group-hover:opacity-90 group-hover:scale-[1.02] filter group-hover:drop-shadow-sm"
              style={{ transformOrigin: `${xx + bw / 2}px ${yTop + hh / 2}px` }}
            >
              <title>{`Clic para ver movimientos de ${b.label}: ${format(b.val, p.valueFormat || 'currency', p.currency || 'MXN')}`}</title>
            </rect>
            <text
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              fontSize="10"
              fontWeight="700"
              fill={labelFill}
            >
              {format(b.val, p.valueFormat || 'currency', p.currency || 'MXN')}
            </text>
            <text
              x={x(i)}
              y={h - 15}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#6D85A1"
              className="group-hover:fill-[#061D3A] transition-colors"
            >
              {b.label.slice(0, 10)}
            </text>
            {i < count - 1 && (
              <line
                x1={xx + bw}
                y1={y(b.top)}
                x2={x(i + 1) - bw / 2}
                y2={y(b.top)}
                stroke="#94A3B8"
                strokeDasharray="3,3"
                strokeWidth="1.5"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

function TreemapChart({
  p,
  w,
  h,
  data,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  data: RecordRow[];
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  const key = p.valueKey || 'amount';
  const catKey = p.categoryKey || 'name';
  const items = data.length ? data : rows(p.data, p.dataPath);
  if (!items.length) return null;

  const total = items.reduce((sum, d) => sum + Math.max(0, num(d[key])), 0) || 1;
  const usableW = w - margin.left - margin.right;
  const usableH = h - margin.top - margin.bottom;
  const halfH = usableH / 2;

  const topHalf = items.slice(0, Math.ceil(items.length / 2));
  const bottomHalf = items.slice(Math.ceil(items.length / 2));
  const topTotal = topHalf.reduce((sum, d) => sum + Math.max(0, num(d[key])), 0) || 1;
  const bottomTotal = bottomHalf.reduce((sum, d) => sum + Math.max(0, num(d[key])), 0) || 1;

  const rects: Array<{ x: number; y: number; w: number; h: number; d: RecordRow; color: string; idx: number }> = [];

  let xAcc = margin.left;
  topHalf.forEach((d, i) => {
    const ww = (Math.max(0, num(d[key])) / topTotal) * usableW;
    rects.push({ x: xAcc, y: margin.top, w: ww, h: halfH - 2, d, color: palette[i % palette.length], idx: i });
    xAcc += ww;
  });

  xAcc = margin.left;
  bottomHalf.forEach((d, i) => {
    const ww = (Math.max(0, num(d[key])) / bottomTotal) * usableW;
    rects.push({ x: xAcc, y: margin.top + halfH + 2, w: ww, h: halfH - 2, d, color: palette[(i + topHalf.length) % palette.length], idx: i + topHalf.length });
    xAcc += ww;
  });

  return (
    <g>
      {rects.map(r => {
        const val = num(r.d[key]);
        const pct = Math.round((val / total) * 100);
        const catName = String(r.d[catKey] || 'Categoría');
        return (
          <g
            key={r.idx}
            className="group cursor-pointer"
            onClick={() => {
              onDrilldown?.({
                title: catName,
                category: catName,
                amount: val,
                color: r.color,
                month: chartMonth,
                subtitle: `${pct}% del total presupuestado (${format(val, p.valueFormat || 'currency', p.currency || 'MXN')})`,
              });
            }}
          >
            <rect
              x={r.x + 1}
              y={r.y + 1}
              width={Math.max(r.w - 2, 2)}
              height={Math.max(r.h - 2, 2)}
              rx="6"
              fill={r.color}
              stroke="#FFFFFF"
              strokeWidth="2"
              className="transition-all duration-150 group-hover:opacity-90 group-hover:scale-[1.01] filter group-hover:drop-shadow-sm"
              style={{ cursor: 'pointer', transformOrigin: `${r.x + r.w / 2}px ${r.y + r.h / 2}px` }}
            >
              <title>{`Clic para ver movimientos de ${catName}: ${format(val, p.valueFormat || 'currency', p.currency || 'MXN')} (${pct}%)`}</title>
            </rect>
            {r.w > 45 && r.h > 35 && (
              <g pointerEvents="none">
                <text
                  x={r.x + 8}
                  y={r.y + 18}
                  fontSize="11"
                  fontWeight="700"
                  fill="#FFFFFF"
                >
                  {catName.slice(0, Math.floor(r.w / 8))}
                </text>
                <text
                  x={r.x + 8}
                  y={r.y + 32}
                  fontSize="10"
                  fontWeight="600"
                  fill="rgba(255,255,255,0.85)"
                >
                  {format(val, p.valueFormat || 'currency', p.currency || 'MXN')}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function Special({
  p,
  w,
  h,
  data,
  chartMonth,
  onDrilldown
}: {
  p: ChartProps;
  w: number;
  h: number;
  data: RecordRow[];
  chartMonth: string;
  onDrilldown?: (req: ChartDrilldownRequest) => void;
}) {
  if (p.chartType === 'sankey') {
    return <SankeyDiagram p={p} w={w} h={h} chartMonth={chartMonth} onDrilldown={onDrilldown} />;
  }
  if (p.chartType === 'calendarHeatmap' || p.chartType === 'heatmap') {
    return <CalendarHeatmapChart p={p} w={w} h={h} data={data} chartMonth={chartMonth} onDrilldown={onDrilldown} />;
  }
  if (p.chartType === 'waterfall') {
    return <WaterfallChart p={p} w={w} h={h} data={data} chartMonth={chartMonth} onDrilldown={onDrilldown} />;
  }
  if (p.chartType === 'treemap') {
    return <TreemapChart p={p} w={w} h={h} data={data} chartMonth={chartMonth} onDrilldown={onDrilldown} />;
  }
  const key = p.valueKey || 'value';
  if (p.chartType === 'histogram') {
    const values = data.map(d => num(d[key]));
    const [lo, hi] = extent(values), bins = Array.from({ length: 8 }, () => 0);
    values.forEach(v => bins[Math.min(7, Math.floor((v - lo) / (hi - lo || 1) * 8))]++);
    return <Cartesian p={{ ...p, chartType: 'bar', data: { bins: bins.map((v, i) => ({ label: Math.round(lo + (hi - lo) * i / 8), value: v })) }, dataPath: '/bins', categoryKey: 'label', valueKey: 'value' }} w={w} h={h} data={[]} series={[]} chartMonth={chartMonth} onDrilldown={onDrilldown} />;
  }
  if (p.chartType === 'sunburst') {
    const total = data.reduce((a, d) => a + Math.max(0, num(d[key])), 0) || 1, cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 24;
    let a = -Math.PI / 2;
    return (
      <>
        {data.map((d, i) => {
          const next = a + Math.max(0, num(d[key])) / total * Math.PI * 2;
          const ret = (
            <path
              key={i}
              d={arc(cx, cy, r, a, next, r * 0.42)}
              fill={palette[i % palette.length]}
              stroke="#fff"
              className="cursor-pointer hover:opacity-85"
              onClick={() => onDrilldown?.({
                title: String(d[p.categoryKey || 'name'] || `Segmento ${i + 1}`),
                category: String(d[p.categoryKey || 'name'] || ''),
                amount: num(d[key]),
                color: palette[i % palette.length],
                month: chartMonth,
              })}
            />
          );
          a = next;
          return ret;
        })}
      </>
    );
  }
  if (p.chartType === 'scatter' || p.chartType === 'bubble') {
    const s = p.series?.[0], xk = s?.xKey || p.categoryKey || 'x', yk = s?.yKey || key, sk = s?.sizeKey || 'size';
    const [xl, xh] = extent(data.map(d => num(d[xk]))), [yl, yh] = extent(data.map(d => num(d[yk]))), [sl, sh] = extent(data.map(d => num(d[sk], 1)));
    return (
      <>
        {axis(w, h, data.map(d => num(d[yk])), v => format(v, p.valueFormat, p.currency))}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={scale(num(d[xk]), [xl, xh], [margin.left, w - margin.right])}
            cy={scale(num(d[yk]), [yl, yh], [h - margin.bottom, margin.top])}
            r={p.chartType === 'bubble' ? 4 + 16 * scale(num(d[sk], 1), [sl, sh], [0, 1]) : 5}
            fill={palette[i % palette.length]}
            opacity=".72"
            className="cursor-pointer hover:opacity-100"
            onClick={() => onDrilldown?.({
              title: `${d[xk]} · ${d[yk]}`,
              category: String(d[xk]),
              amount: num(d[yk]),
              color: palette[i % palette.length],
              month: chartMonth,
            })}
          >
            <title>{`${d[xk]} · ${d[yk]}`}</title>
          </circle>
        ))}
      </>
    );
  }
  if (p.chartType === 'candlestick') {
    const s = p.series?.[0], ok = s?.openKey || 'open', hk = s?.highKey || 'high', lk = s?.lowKey || 'low', ck = s?.closeKey || 'close';
    const vals = data.flatMap(d => [num(d[hk]), num(d[lk])]), [lo, hi] = extent(vals), step = (w - margin.left - margin.right) / Math.max(data.length, 1);
    return (
      <>
        {axis(w, h, vals, v => format(v, p.valueFormat, p.currency))}
        {data.map((d, i) => {
          const x = margin.left + step * (i + 0.5), up = num(d[ck]) >= num(d[ok]), yy = (v: number) => scale(v, [lo, hi], [h - margin.bottom, margin.top]);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={yy(num(d[hk]))} y2={yy(num(d[lk]))} stroke={up ? '#008A5A' : '#C7354F'} />
              <rect x={x - step * 0.25} y={yy(Math.max(num(d[ok]), num(d[ck])))} width={step * 0.5} height={Math.max(2, Math.abs(yy(num(d[ok])) - yy(num(d[ck]))))} fill={up ? '#008A5A' : '#C7354F'} />
            </g>
          );
        })}
      </>
    );
  }
  if (p.chartType === 'boxplot') {
    const s = p.series?.[0], q1 = s?.q1Key || 'q1', med = s?.medianKey || 'median', q3 = s?.q3Key || 'q3', min = s?.minKey || 'min', max = s?.maxKey || 'max';
    const vals = data.flatMap(d => [num(d[min]), num(d[q1]), num(d[med]), num(d[q3]), num(d[max])]), [lo, hi] = extent(vals), step = (w - margin.left - margin.right) / Math.max(data.length, 1), yy = (v: number) => scale(v, [lo, hi], [h - margin.bottom, margin.top]);
    return (
      <>
        {axis(w, h, vals, v => format(v, p.valueFormat, p.currency))}
        {data.map((d, i) => {
          const x = margin.left + step * (i + 0.5);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={yy(num(d[min]))} y2={yy(num(d[max]))} stroke="#4A515E" />
              <rect x={x - step * 0.25} y={yy(num(d[q3]))} width={step * 0.5} height={Math.abs(yy(num(d[q1])) - yy(num(d[q3])))} fill="#FDE2E4" stroke="#EB0029" />
              <line x1={x - step * 0.25} x2={x + step * 0.25} y1={yy(num(d[med]))} y2={yy(num(d[med]))} stroke="#EB0029" strokeWidth="2" />
            </g>
          );
        })}
      </>
    );
  }
  if (p.chartType === 'bullet') {
    const max = num(resolve(p.gaugeMax, p.data), Math.max(num(resolve(p.bulletTarget, p.data)), num(resolve(p.bulletValue, p.data)), 1));
    const v = num(resolve(p.bulletValue, p.data)), t = num(resolve(p.bulletTarget, p.data));
    return (
      <>
        <rect x={margin.left} y={h / 2 - 18} width={w - margin.left - margin.right} height="36" rx="7" fill="#EAEFF5" />
        {(p.thresholds || []).map((b, i) => (
          <rect key={i} x={scale(num(resolve(b.from, p.data)), [0, max], [margin.left, w - margin.right])} y={h / 2 - 18} width={scale(num(resolve(b.to, p.data)) - num(resolve(b.from, p.data)), [0, max], [0, w - margin.left - margin.right])} height="36" fill={statusColor[b.status || 'neutral']} opacity=".24" />
        ))}
        <rect x={margin.left} y={h / 2 - 8} width={scale(v, [0, max], [0, w - margin.left - margin.right])} height="16" rx="4" fill="#E4003B" />
        <line x1={scale(t, [0, max], [margin.left, w - margin.right])} x2={scale(t, [0, max], [margin.left, w - margin.right])} y1={h / 2 - 28} y2={h / 2 + 28} stroke="#061D3A" strokeWidth="3" />
      </>
    );
  }
  if (p.chartType === 'radar') {
    const n = Math.max(data.length, 3), cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 38, max = Math.max(...data.map(d => num(d[key])), 1);
    const radarPoints = data.map((d, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / n, rr = r * num(d[key]) / max;
      return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as [number, number];
    });
    return (
      <>
        {Array.from({ length: n }, (_, i) => {
          const a = -Math.PI / 2 + i * Math.PI * 2 / n;
          return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#E2E6EC" />;
        })}
        <path d={path(radarPoints) + ' Z'} fill="#EB0029" opacity=".2" stroke="#EB0029" strokeWidth="2" />
      </>
    );
  }
  return <Cartesian p={p} w={w} h={h} data={data} series={p.series || []} chartMonth={chartMonth} onDrilldown={onDrilldown} />;
}

export function Chart(p: ChartProps) {
  const [ref, w] = useWidth(), h = p.height || 300;
  const [activeDrilldown, setActiveDrilldown] = useState<ChartDrilldownRequest | null>(null);
  const data = rows(p.data, p.dataPath);
  const title = resolve(p.title, p.data);
  const subtitle = resolve(p.subtitle, p.data);
  const series = useMemo(() => p.series || [], [p.series]);
  const isRadial = ['pie', 'donut'].includes(p.chartType);

  const chartPeriod = (p.data as any)?.period || (p as any).period || '';
  const chartMonth = parseMonthString(chartPeriod || subtitle || title || '2026-09');

  return (
    <>
      <section
        ref={ref}
        className={p.className}
        style={{
          background: '#FFFFFF',
          border: '1px solid #DCE7F0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 24px -16px rgba(6,29,58,.28)'
        }}
      >
        {title && (
          <h3
            style={{
              margin: 0,
              padding: '13px 18px',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              background: '#EB0029',
              letterSpacing: '-0.01em'
            }}
          >
            {title}
          </h3>
        )}
        <div style={{ padding: 20 }}>
          {subtitle && (
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6D85A1' }}>
              {subtitle}
            </p>
          )}
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title || p.chartType}>
            {isRadial ? (
              <Radial p={p} w={w} h={h} data={data} chartMonth={chartMonth} onDrilldown={setActiveDrilldown} />
            ) : p.chartType === 'gauge' ? (
              <Gauge p={p} w={w} h={h} />
            ) : (
              <Special p={p} w={w} h={h} data={data} chartMonth={chartMonth} onDrilldown={setActiveDrilldown} />
            )}
          </svg>
          {resolve(p.showLegend, p.data) !== false && series.length > 1 && (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#526B87', fontWeight: 600 }}>
              {series.map((s, i) => (
                <span key={i}>
                  <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 8, background: s.color || palette[i], marginRight: 6 }} />
                  {resolve(s.name, p.data) || `Serie ${i + 1}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {activeDrilldown && (
        <InteractiveDrilldownModal
          isOpen={!!activeDrilldown}
          onClose={() => setActiveDrilldown(null)}
          title={activeDrilldown.title}
          category={activeDrilldown.category}
          date={activeDrilldown.date}
          month={activeDrilldown.month || chartMonth}
          period={activeDrilldown.period || chartPeriod || subtitle}
          targetAmount={activeDrilldown.amount}
          color={activeDrilldown.color}
          subtitle={activeDrilldown.subtitle}
        />
      )}
    </>
  );
}

export default Chart;
