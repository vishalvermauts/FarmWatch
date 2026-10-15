## 2025-02-23 - Memoize Expensive GIS Calculations
**Learning:** `calculateGeodesicAreaHa` and array mapping operations (like generating SVG paths) were running on every re-render in `FieldGisView.tsx`. Since React re-renders frequently due to mouse tracking, this is a major bottleneck for GIS components.
**Action:** Use `useMemo` for static and derived values from geometries (like area calculation, outer path points, and internal buffer coordinates). Use `React.useCallback` for static projection functions.
