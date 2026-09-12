import React from 'react';
import type { KpiCardProps } from './types';
import { format, resolve } from './utils';

export function KpiCard(p: KpiCardProps) {
  const value = resolve(p.value, p.data) ?? 0;
  const delta = resolve(p.deltaValue, p.data);
  const label = resolve(p.label, p.data) || '';
  return <article className={p.className} style={{ background: '#fff', border: '1px solid #E2E6EC', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(28,30,33,.06)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EB0029', color: '#fff', padding: '10px 16px', fontSize: 12, fontWeight: 700 }}><span>{label}</span>{p.icon && <span style={{ color: '#fff' }}>{p.icon}</span>}</div>
    <div style={{ padding: 20 }}><strong style={{ display: 'block', fontSize: 28, lineHeight: 1.2, color: '#1C1E21', margin: '0 0 10px', fontVariantNumeric: 'tabular-nums' }}>{format(value, p.valueFormat, p.currency)}</strong>{delta !== undefined && <span style={{ display: 'inline-block', background: '#FFF3D1', borderRadius: 99, padding: '4px 8px', fontSize: 12, color: p.deltaDirection === 'down' ? '#B42318' : '#8A5B00', fontWeight: 700 }}>{p.deltaDirection === 'up' ? '↑' : p.deltaDirection === 'down' ? '↓' : '→'} {format(Math.abs(delta), 'percent')}</span>}</div>
  </article>;
}
