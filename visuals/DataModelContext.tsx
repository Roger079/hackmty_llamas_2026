import React, { createContext, useContext, useMemo } from 'react';
import { createRootScope, ScopeStack, type JsonValue } from '../lib/jsonpointer';

const ScopeContext = createContext<ScopeStack | null>(null);

/** Wrap a surface (or a ChildList template item) with the data model it resolves against. */
export function DataModelProvider({ dataModel, children }: { dataModel: JsonValue; children: React.ReactNode }) {
  const scope = useMemo(() => createRootScope(dataModel), [dataModel]);
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

/** Used when entering a ChildList template item, pushing a new innermost scope (checklist #47). */
export function ScopedProvider({ absolutePath, value, children }: { absolutePath: string; value: JsonValue; children: React.ReactNode }) {
  const parentScope = useContext(ScopeContext);
  const scope = useMemo(() => {
    if (!parentScope) return createRootScope(value);
    return parentScope.push(absolutePath, value);
  }, [parentScope, absolutePath, value]);
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

export function useScope(): ScopeStack {
  const scope = useContext(ScopeContext);
  if (!scope) throw new Error('useScope() must be used within a <DataModelProvider>.');
  return scope;
}

/** Resolve an array-typed JsonPointer to a plain array, defaulting to []. */
export function useResolvedArray<T = Record<string, unknown>>(pointer: string | undefined): T[] {
  const scope = useScope();
  if (!pointer) return [];
  const value = scope.resolve(pointer);
  return Array.isArray(value) ? (value as T[]) : [];
}
