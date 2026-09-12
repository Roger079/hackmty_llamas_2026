/**
 * Minimal, dependency-free reimplementation of @tanstack/react-virtual's
 * fixed-size-row windowing: given a scroll container's scrollTop/height and
 * a uniform row height, compute which row indices are visible (plus an
 * overscan buffer) and the total scrollable height.
 *
 * checklist #41 — Row virtualization (large movement/transaction lists)
 */
import { useState, useRef, useCallback } from 'react';

export interface VirtualItem {
  index: number;
  start: number; // px offset from top
  size: number;
}

export interface VirtualizerOptions {
  count: number;
  estimateSize: number;
  overscan?: number;
}

export interface Virtualizer {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollElementRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}

export function useVirtualizer({ count, estimateSize, overscan = 6 }: VirtualizerOptions): Virtualizer {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollElementRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
  }, []);

  const totalSize = count * estimateSize;
  const firstVisible = Math.max(0, Math.floor(scrollTop / estimateSize) - overscan);
  const lastVisible = Math.min(
    count - 1,
    Math.ceil((scrollTop + (viewportHeight || 400)) / estimateSize) + overscan
  );

  const virtualItems: VirtualItem[] = [];
  for (let i = firstVisible; i <= lastVisible; i++) {
    virtualItems.push({ index: i, start: i * estimateSize, size: estimateSize });
  }

  return { virtualItems, totalSize, scrollElementRef, onScroll };
}
