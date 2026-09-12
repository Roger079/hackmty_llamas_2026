import React, { useState } from 'react';
import { ActionContext } from '../types/a2ui';

interface CategoryItem {
  name: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}

interface SpendingDonutCardProps {
  period?: string;
  totalSpent?: number;
  total_spent?: number;
  previousPeriodSpent?: number;
  previous_period_spent?: number;
  trend_pct?: number;
  categories?: any[];
  top_merchants?: Array<{ merchant: string; amount: number; category: string }>;
  summary?: string;
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}

const BANORTE_PALETTE = ['#EB0029', '#004B87', '#00A859', '#F7931A', '#7E57C2', '#C89319', '#E4003B', '#617A96'];

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, r: number, innerR: number, startAngle: number, endAngle: number) {
  const delta = endAngle - startAngle;
  const clampedDelta = delta >= 360 ? 359.99 : Math.max(delta, 0.01);
  const clampedEnd = startAngle + clampedDelta;

  const startOuter = polarToCartesian(cx, cy, r, clampedEnd);
  const endOuter = polarToCartesian(cx, cy, r, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, clampedEnd);

  const largeArcFlag = clampedDelta > 180 ? 1 : 0;

  return [
    'M', startOuter.x.toFixed(2), startOuter.y.toFixed(2),
    'A', r, r, 0, largeArcFlag, 0, endOuter.x.toFixed(2), endOuter.y.toFixed(2),
    'L', startInner.x.toFixed(2), startInner.y.toFixed(2),
    'A', innerR, innerR, 0, largeArcFlag, 1, endInner.x.toFixed(2), endInner.y.toFixed(2),
    'Z',
  ].join(' ');
}

export const SpendingDonutCard: React.FC<SpendingDonutCardProps> = (props) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawCats = Array.isArray(props.categories) && props.categories.length > 0 ? props.categories : [
    { name: 'Supermercado & Despensa', amount: 5420, percentage: 36.5, color: '#EB0029' },
    { name: 'Restaurantes & Cafés', amount: 3280, percentage: 22.1, color: '#004B87' },
    { name: 'Servicios & Telefonía', amount: 2650, percentage: 17.8, color: '#00A859' },
    { name: 'Transporte & Gasolina', amount: 1950, percentage: 13.1, color: '#F7931A' },
    { name: 'Farmacia & Salud', amount: 1550, percentage: 10.5, color: '#7E57C2' }
  ];

  const totalCalculatedFromRaw = rawCats.reduce((sum, item: any) => sum + (Number(item?.amount ?? item?.monto ?? 0) || 0), 0);

  const cats: CategoryItem[] = rawCats.map((c: any, idx: number) => {
    const rawName = c?.name || c?.label || c?.categoria || c?.category || c?.rubro || c?.nombre;
    const name = rawName && String(rawName).trim() ? String(rawName).trim() : `Categoría ${idx + 1}`;
    const amount = Number(c?.amount ?? c?.monto ?? 0) || 0;
    let percentage = Number(c?.percentage ?? c?.porcentaje ?? 0);
    if (!percentage && totalCalculatedFromRaw > 0) {
      percentage = Math.round((amount / totalCalculatedFromRaw) * 100);
    }
    const color = c?.color || BANORTE_PALETTE[idx % BANORTE_PALETTE.length];
    return { name, amount, percentage, color, icon: c?.icon };
  });

  const totalCalculated = cats.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const total = Number(props.totalSpent ?? props.total_spent ?? totalCalculated) || totalCalculated;

  // Compute SVG Donut arc angles
  const cx = 140;
  const cy = 110;
  const r = 85;
  const innerR = 52;

  let currentAngle = 0;
  const arcSegments = cats.map((cat, idx) => {
    const angle = (cat.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    return {
      cat,
      idx,
      pathD: describeArc(cx, cy, r, innerR, startAngle, endAngle),
    };
  });

  const activeCategory = hoveredIdx !== null ? cats[hoveredIdx] : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-red-100 bg-white text-slate-900 shadow-xs animate-in fade-in duration-200">
      {/* 1. Authentic Banorte Red Header */}
      <div className="flex items-center justify-between bg-[#EB0029] px-4 py-3 text-white">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold tracking-tight">
            Gastos por Categoría · {props.period || 'Septiembre 2026'}
          </h3>
          <p className="text-[10px] text-red-100">
            {props.summary || 'Distribución de tus consumos del periodo en tiempo real'}
          </p>
        </div>
        {props.trend_pct !== undefined ? (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
            {props.trend_pct > 0 ? `+${props.trend_pct}%` : `${props.trend_pct}%`} vs mes ant.
          </span>
        ) : (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
            Auditado
          </span>
        )}
      </div>

      {/* 2. Donut Chart Section */}
      <div className="p-4 flex flex-col items-center">
        <svg
          viewBox="0 0 280 220"
          className="w-full max-w-[280px] h-[200px] overflow-visible"
          role="img"
          aria-label="Gráfica de pastel de gastos por categoría"
        >
          {arcSegments.map(({ cat, idx, pathD }) => {
            const isHovered = hoveredIdx === idx;
            return (
              <path
                key={idx}
                d={pathD}
                fill={cat.color}
                stroke="#FFFFFF"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: `${cx}px ${cy}px`,
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <title>{`${cat.name}: $${cat.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN (${cat.percentage}%)`}</title>
              </path>
            );
          })}

          {/* Center text hole */}
          <text x={cx} y={cy - 8} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
            {activeCategory ? activeCategory.name.slice(0, 16) : 'Total'}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="text-base font-black fill-slate-900 tabular-nums"
          >
            ${(activeCategory ? activeCategory.amount : total).toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })}
          </text>
          <text x={cx} y={cy + 25} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">
            {activeCategory ? `${activeCategory.percentage}% del total` : 'MXN'}
          </text>
        </svg>
      </div>

      {/* 3. Sleek, Unified Category Breakdown (Single Card, No Detached Table) */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h4 className="text-xs font-black text-slate-800 tracking-tight">Desglose Detallado de Gastos</h4>
          <span className="text-[10px] text-slate-500 font-semibold">{cats.length} categorías</span>
        </div>

        <div className="space-y-2.5">
          {cats.map((c, i) => (
            <div
              key={i}
              className={`space-y-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
                hoveredIdx === i ? 'bg-white shadow-2xs ring-1 ring-slate-200' : 'hover:bg-white/60'
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: c.color }} />
                  <span className="font-bold text-slate-800 truncate text-[11px]">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black tabular-nums text-slate-900 text-[11px]">
                    ${c.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[9px] font-bold text-slate-400">MXN</span>
                  </span>
                  <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 font-mono text-[10px] font-bold text-slate-700">
                    {c.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, c.percentage))}%`, backgroundColor: c.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 px-0.5 text-xs font-black text-slate-900">
          <span className="uppercase tracking-wider text-[10px] text-slate-500">Total Periodo (100%)</span>
          <span className="tabular-nums text-xs sm:text-sm text-[#EB0029] font-black">
            ${totalCalculated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="text-[10px] font-bold text-slate-500">MXN</span>
          </span>
        </div>
      </div>
    </article>
  );
};
