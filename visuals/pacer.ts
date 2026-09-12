/**
 * Minimal, dependency-free reimplementation of @tanstack/react-pacer's
 * `useDebouncer`: delays invoking a callback until `wait` ms have passed
 * since the last call, cancelling any pending invocation in between.
 *
 * checklist #36 — Debounced input handling (DataTable/ChoicePicker filterable typing)
 */
import { useCallback, useEffect, useRef } from 'react';

export interface DebouncerOptions {
  wait: number;
}

export function useDebouncer<Args extends unknown[]>(fn: (...args: Args) => void, { wait }: DebouncerOptions) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const debounced = useCallback(
    (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fnRef.current(...args), wait);
    },
    [wait]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { debounced, cancel };
}

/** Convenience hook for a debounced text filter input (DataTable/ComparisonTable search boxes). */
export function useDebouncedFilter(onFilter: (value: string) => void, wait = 250) {
  const { debounced } = useDebouncer(onFilter, { wait });
  return debounced;
}
