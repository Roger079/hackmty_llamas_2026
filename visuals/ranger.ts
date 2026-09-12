/**
 * Minimal, dependency-free reimplementation of @tanstack/react-ranger:
 * pointer/drag handling for one or more draggable "thumbs" on a linear
 * track, clamped to [min, max] and optionally snapped to `step`.
 *
 * checklist #33 — Pointer/drag handling for a draggable handle
 * checklist #34 — Multi-thumb range state (min/max pair)
 */
import { useCallback, useRef, useState } from 'react';

export interface RangerOptions {
  min: number;
  max: number;
  step?: number;
  values: number[]; // one value per thumb; length 1 = simple slider, length 2 = range
  onChange: (values: number[]) => void;
}

export interface RangerThumb {
  value: number;
  index: number;
  percent: number; // 0..100 position along the track
  onPointerDown: (e: React.PointerEvent) => void;
}

export interface Ranger {
  trackRef: React.RefObject<HTMLDivElement>;
  thumbs: RangerThumb[];
  onTrackClick: (e: React.MouseEvent) => void;
}

function clampToStep(v: number, min: number, max: number, step: number): number {
  const stepped = Math.round((v - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
}

export function useRanger({ min, max, step = 1, values, onChange }: RangerOptions): Ranger {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const pxToValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return clampToStep(min + t * (max - min), min, max, step);
    },
    [min, max, step]
  );

  const beginDrag = useCallback(
    (index: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      setActiveIndex(index);

      const onMove = (moveEvent: PointerEvent) => {
        const nextValue = pxToValue(moveEvent.clientX);
        const nextValues = [...values];
        nextValues[index] = nextValue;
        // keep multi-thumb ranges ordered (min thumb can't pass max thumb)
        nextValues.sort((a, b) => a - b);
        onChange(nextValues);
      };
      const onUp = () => {
        setActiveIndex(null);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [values, onChange, pxToValue]
  );

  const onTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const nextValue = pxToValue(e.clientX);
      // move the nearest thumb
      let nearest = 0;
      let bestDist = Infinity;
      values.forEach((v, i) => {
        const d = Math.abs(v - nextValue);
        if (d < bestDist) {
          bestDist = d;
          nearest = i;
        }
      });
      const nextValues = [...values];
      nextValues[nearest] = nextValue;
      nextValues.sort((a, b) => a - b);
      onChange(nextValues);
    },
    [values, onChange, pxToValue]
  );

  const thumbs: RangerThumb[] = values.map((value, index) => ({
    value,
    index,
    percent: ((value - min) / (max - min || 1)) * 100,
    onPointerDown: beginDrag(index),
  }));

  return { trackRef, thumbs, onTrackClick };
}
