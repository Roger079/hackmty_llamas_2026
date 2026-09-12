import React from 'react';
import type { TimelineProps } from './types';
import { resolve, rows } from './utils';

const colors = { completed: '#008744', current: '#EB0029', pending: '#7A8290', error: '#D32F2F' };

export function Timeline(p: TimelineProps) {
  const steps = p.steps || (rows(p.data, p.stepsPath) as any[]);
  const horizontal = p.orientation === 'horizontal';
  return <section className={p.className} style={{ background: '#fff', border: '1px solid #E2E6EC', borderRadius: 16, overflow: 'hidden' }}>
    {resolve(p.title, p.data) && <h3 style={{ margin: 0, padding: '13px 20px', background: '#EB0029', color: '#fff', fontSize: 16 }}>{resolve(p.title, p.data)}</h3>}
    <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', gap: horizontal ? 0 : 18, overflowX: 'auto', padding: 20 }}>{steps.map((s, i) => { const color = colors[s.status as keyof typeof colors] || colors.pending; return <div key={i} style={{ display: 'flex', flex: horizontal ? 1 : undefined, minWidth: horizontal ? 130 : undefined, gap: 10, position: 'relative' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', background: color, color: '#fff', fontSize: 12, fontWeight: 700, zIndex: 1 }}>{s.status === 'completed' ? '✓' : i + 1}</span>{i < steps.length - 1 && <i style={{ width: horizontal ? '100%' : 2, height: horizontal ? 2 : 36, background: '#E2E6EC', display: 'block' }} />}</div><div style={{ paddingBottom: horizontal ? 0 : 8 }}><strong style={{ fontSize: 14, color: '#1C1E21' }}>{resolve(s.label, p.data)}</strong>{s.date && <div style={{ fontSize: 12, color: '#7A8290', marginTop: 2 }}>{resolve(s.date, p.data)}</div>}{s.description && <p style={{ fontSize: 12, color: '#4A515E', margin: '5px 0 0' }}>{resolve(s.description, p.data)}</p>}</div></div>; })}</div>
  </section>;
}
