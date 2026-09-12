/**
 * Minimal, dependency-free reimplementation of the @tanstack/table-core
 * surface we actually use: `createColumnHelper`, `getCoreRowModel`,
 * `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`, and
 * column pinning flags. API shape mirrors the real package so call sites
 * read the same as if `@tanstack/react-table` were installed.
 *
 * checklist #37 — Column definitions / row model abstraction
 * checklist #38 — Client-side sorting
 * checklist #39 — Client-side filtering
 * checklist #40 — Pagination
 * checklist #42 — Column pinning/highlight
 */

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorFn: (row: T) => unknown;
  /** Custom cell renderer; receives the raw value and the row. */
  cell?: (value: unknown, row: T) => unknown;
  sortable?: boolean;
  /** checklist #42 — pin this column (e.g. mark "tu plan actual"). */
  pinned?: 'left' | 'right' | false;
}

export function createColumnHelper<T>() {
  return {
    accessor(key: keyof T & string, def: Omit<ColumnDef<T>, 'id' | 'accessorFn'> & { id?: string }): ColumnDef<T> {
      return { id: def.id ?? key, accessorFn: (row: T) => row[key], ...def };
    },
    display(def: ColumnDef<T>): ColumnDef<T> {
      return def;
    },
  };
}

export type SortDirection = 'asc' | 'desc';
export interface SortingState {
  id: string;
  desc: boolean;
}

export interface TableState<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sorting: SortingState[];
  globalFilter: string;
  pageIndex: number;
  pageSize: number;
}

/** checklist #37 — the identity row model: just `data` as-is. */
export function getCoreRowModel<T>(data: T[]): T[] {
  return data;
}

/** checklist #39 — substring match across every column's stringified value. */
export function getFilteredRowModel<T>(rows: T[], columns: ColumnDef<T>[], globalFilter: string): T[] {
  if (!globalFilter.trim()) return rows;
  const needle = globalFilter.trim().toLowerCase();
  return rows.filter((row) =>
    columns.some((col) => String(col.accessorFn(row) ?? '').toLowerCase().includes(needle))
  );
}

/** checklist #38 — stable multi-column sort (last sort wins as primary key, TanStack-style). */
export function getSortedRowModel<T>(rows: T[], columns: ColumnDef<T>[], sorting: SortingState[]): T[] {
  if (sorting.length === 0) return rows;
  const colById = new Map(columns.map((c) => [c.id, c]));
  const indexed = rows.map((row, i) => ({ row, i }));

  indexed.sort((a, b) => {
    for (const s of sorting) {
      const col = colById.get(s.id);
      if (!col) continue;
      const av = col.accessorFn(a.row);
      const bv = col.accessorFn(b.row);
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      if (cmp !== 0) return s.desc ? -cmp : cmp;
    }
    return a.i - b.i; // stable fallback
  });

  return indexed.map((x) => x.row);
}

/** checklist #40 — slice into pages. */
export function getPaginationRowModel<T>(rows: T[], pageIndex: number, pageSize: number): { rows: T[]; pageCount: number } {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = pageIndex * pageSize;
  return { rows: rows.slice(start, start + pageSize), pageCount };
}

/** Convenience: run the full core -> filter -> sort -> paginate pipeline in one call. */
export function processTable<T>(state: TableState<T>) {
  const core = getCoreRowModel(state.data);
  const filtered = getFilteredRowModel(core, state.columns, state.globalFilter);
  const sorted = getSortedRowModel(filtered, state.columns, state.sorting);
  const paginated = getPaginationRowModel(sorted, state.pageIndex, state.pageSize);
  return { filteredCount: filtered.length, ...paginated };
}
