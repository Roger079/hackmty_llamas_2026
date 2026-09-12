import { scaleLinear, domainFromValuesInclZero } from '../scales/linear';
import { scaleBand } from '../scales/band';
import { scaleTime } from '../scales/time';

export interface XYPoint {
  x: string | number | Date;
  y: number;
  raw: Record<string, unknown>;
}

export function extractXY(rows: Record<string, unknown>[], xKey: string, yKey: string): XYPoint[] {
  return rows.map((row) => ({ x: row[xKey] as string | number, y: Number(row[yKey] ?? 0), raw: row }));
}

export function isDateLike(value: unknown): boolean {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}/.test(value);
}

/** Build the right x-scale (time vs band) depending on whether x values look like dates. */
export function buildXScale(points: XYPoint[], range: [number, number]) {
  if (points.length > 0 && isDateLike(points[0].x)) {
    const dates = points.map((p) => new Date(p.x as string));
    const domain: [Date, Date] = [
      new Date(Math.min(...dates.map((d) => d.getTime()))),
      new Date(Math.max(...dates.map((d) => d.getTime()))),
    ];
    const scale = scaleTime(domain, range);
    return { kind: 'time' as const, scale, toX: (p: XYPoint) => scale(new Date(p.x as string)) };
  }
  const categories = points.map((p) => String(p.x));
  const scale = scaleBand(categories, range, { paddingInner: 0.3, paddingOuter: 0.1 });
  return { kind: 'band' as const, scale, toX: (p: XYPoint) => (scale(String(p.x)) ?? 0) + scale.bandwidth / 2 };
}

export function buildYScale(values: number[], range: [number, number]) {
  const domain = domainFromValuesInclZero(values);
  return scaleLinear(domain, range);
}

export const MARGIN = { top: 16, right: 20, bottom: 32, left: 56 };
