# System Architecture — FarmWatch

## 1. System Overview
FarmWatch is a production-grade full-stack agricultural inspection platform designed for farmers and extension officers in India and expanding BRICS regions. It reconciles dated satellite observations, regional weather forecasts, soil parameters, and smartphone field photography to guide safe, grounded physical crop inspection.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FARMER / COOPERATIVE CLIENT                      │
│   • React 19 + Tailwind v4 + Lucide Icons                                   │
│   • Interactive GIS Polygon Editor & Geodesic Calculation Engine            │
│   • Multi-Band False Color Visualization (NDVI / NDMI / TrueColor)          │
│   • Offline Summary Cache & Bilingual UI (English & Hindi)                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / JSON API (Port 3000)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    UNIFIED EXPRESS BACKEND (server.ts)                      │
│                                                                             │
│  [Middleware Pipeline]                                                      │
│    ├── Top-Level Body Deserialization (json & urlencoded up to 20MB)        │
│    ├── Defensive Null-Safe Destructuring                                    │
│    └── Security Headers (nosniff, frame-options, XSS filter)                │
│                                                                             │
│  [Domain Service Layer]                                                     │
│    ├── Weather Adapter: Open-Meteo API (Historical & 7-day forecast)        │
│    ├── Satellite Engine: Sentinel-2 L2A Math (NDVI, NDMI, 20m Grid, SCL)   │
│    ├── Alert Evaluator: 3-Observation Baseline & >20% Drop Rule              │
│    ├── Agronomy Registry: Verified ICAR, IMD Agromet, FAO Corpus            │
│    └── Privacy Center: Data Export (JSON/MD) & Storage Purge                │
│                                                                             │
│  [Gemini Resilient Fallback Engine]                                         │
│    ├── Primary: gemini-3.8-flash                                            │
│    ├── High-Availability Fallback: gemini-3.6-flash                         │
│    ├── Dynamic Alias: gemini-3.1-flash-lite / gemini-flash-latest           │
│    ├── Deep Reasoning Fallback: gemini-3.7-flash                            │
│    └── Grounded Schema v1 Validator                                         │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
           (gRPC / TLS 1.3)                 (HTTPS REST)
                       ▼                               ▼
       ┌───────────────────────────────┐   ┌───────────────────────────────┐
       │     GOOGLE GEMINI AI API      │   │     OPEN-METEO WEATHER API    │
       │  • Multimodal Photo Synthesis │   │  • Temperature (2m max/min)   │
       │  • Grounded Schema Output     │   │  • Relative Humidity          │
       │  • Regenerative Agro Guidance │   │  • Precipitation Sum          │
       └───────────────────────────────┘   └───────────────────────────────┘
```

## 2. Component Architecture

### A. Frontend Presentation Layer
- **Responsive Workspace**: Built for Android mobile field conditions as well as desktop cooperative consoles.
- **Top Bar Contract**: Single-element brand zone ("FarmWatch"), text navigation links, bilingual switcher (EN / हिन्दी), and primary action triggers.
- **Zero-Pill Discipline**: Metadata displayed as clean unboxed text with `·` separators. No ornamental pill badges on cards.
- **Interactive GIS Engine**: Custom SVG vector graphics engine rendering field boundaries, 10m inward core buffer, 20m raster grid cells, and false-color reflectance gradients.

### B. Geospatial & Satellite Processing Pipeline
- **Sentinel-2 L2A Math**:
  $$\text{NDVI} = \frac{B_8 - B_4}{B_8 + B_4} \quad (\text{NIR: } 10\text{m}, \text{Red: } 10\text{m})$$
  $$\text{NDMI} = \frac{B_8 - B_{11}}{B_8 + B_{11}} \quad (\text{NIR: } 10\text{m}, \text{SWIR: } 20\text{m, aligned at 20m})$$
- **Core Pixel Support**: 10m inward erosion ensures measurements reflect canopy foliage rather than road/boundary mixed pixels.
- **Quality Gates**:
  - Valid core pixels $\ge 9$
  - Core coverage $\ge 70\%$
  - SCL masking excludes classes 3 (cloud shadow), 8 (medium cloud), 9 (high cloud), 10 (cirrus), and 11 (snow/ice).

### C. Meaningful Multimodal AI Engine
- Conforms to **Schema v1** (`ai/schemas/advisory-v1.json`).
- Combines:
  1. Inspected crop photo (RGB inlineData).
  2. Dated Sentinel-2 NDVI & NDMI trajectories.
  3. Regional Open-Meteo precipitation & temperature.
  4. Confirmed soil report parameters (pH, Organic Carbon, N-P-K).
  5. Allowlisted agronomic corpus citations (IMD Agromet & ICAR CRIDA).
- Output contains structured visible observations, differential causes, clarifying questions, step-by-step physical scouting instructions, and regenerative soil practices.
