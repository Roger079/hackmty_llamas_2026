import React, { useState } from 'react';
import type { DataTableProps } from './types';
import { format, resolve, rows, statusColor } from './utils';
import { useDebounced, useTable } from './tanstack-lite';

export function DataTable(p: DataTableProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>();
  const [desc, setDesc] = useState(false);
  const [page, setPage] = useState(0);
  const term = useDebounced(query);
  const data = p.rows || rows(p.data, p.rowsPath);
  const result = useTable(data, sort, desc, term);
  const size = p.pageSize || 10;
  const pages = Math.max(1, Math.ceil(result.length / size));
  const display = result.slice(page * size, (page + 1) * size);
  const title = resolve(p.title, p.data);

  return <section className={p.className} style={{ background: '#fff', border: '1px solid #E2E6EC', borderRadius: 16, overflowX: 'auto' }}>
    {title && <h3 style={{ margin: 0, padding: '13px 18px', background: '#EB0029', color: '#fff', fontSize: 16 }}>{title}</h3>}
    <div style={{ padding: 18 }}>
      {resolve(p.filterable, p.data) !== false && <input value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Buscar movimientos" aria-label="Buscar" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #E2E6EC', borderRadius: 10, marginBottom: 12 }} />}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><thead><tr>{p.columns.map(c => <th key={c.key} onClick={() => c.sortable !== false && resolve(p.sortable, p.data) !== false && (setDesc(sort === c.key ? !desc : false), setSort(c.key))} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #E2E6EC', color: '#4A515E', cursor: c.sortable !== false ? 'pointer' : 'default' }}>{resolve(c.label, p.data)} {sort === c.key && (desc ? '↓' : '↑')}</th>)}</tr></thead><tbody>{display.map((r, i) => <tr key={i}>{p.columns.map(c => { const v = r[c.key]; return <td key={c.key} style={{ padding: '12px 8px', borderBottom: '1px solid #F0F2F5', fontVariantNumeric: c.type === 'currency' || c.type === 'number' ? 'tabular-nums' : undefined }}>{c.type === 'status' || c.key === p.statusColumnKey ? <span style={{ background: `${statusColor[String(v) as keyof typeof statusColor] || '#7A8290'}18`, color: statusColor[String(v) as keyof typeof statusColor] || '#7A8290', padding: '3px 7px', borderRadius: 99, fontWeight: 700, fontSize: 11 }}>{String(v)}</span> : format(v, c.type === 'currency' ? 'currency' : c.type === 'percent' ? 'percent' : c.type === 'date' ? 'date' : c.type === 'number' ? 'number' : 'text')}</td>; })}</tr>)}</tbody></table>
      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 12, fontSize: 12, color: '#4A515E' }}><span>{result.length} registros</span><button disabled={!page} onClick={() => setPage(page - 1)}>Anterior</button><span>{page + 1} / {pages}</span><button disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Siguiente</button></footer>
    </div>
  </section>;
}
