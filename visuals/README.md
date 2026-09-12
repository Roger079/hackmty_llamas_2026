# Banca Visuals

Dependency-free React renderers for the attached Banca Visuals Catalog. Every component accepts the catalog field names, plus a `data` object used to resolve JSON Pointer paths (`/movimientos/gastos`). Dynamic values can be literals or `{ value }` / `{ path }`.

The `tanstack-lite.ts` hooks are source-owned headless equivalents for sorting/filtering/paging, viewport slicing, pointer range interaction, and debounce. No TanStack package is imported.

`Chart` is the catalog dispatcher. It covers all catalog chart types with native SVG geometry, responsive `ResizeObserver` sizing, tooltips through SVG titles where appropriate, palette/semantic colors from the Banorte guide, and optional click actions for radial chart segments.
