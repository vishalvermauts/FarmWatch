# Threat Model — FarmWatch Agricultural Intelligence Platform

## Executive Summary
FarmWatch processes sensitive agricultural telemetry: farmer boundaries, crop health time series, on-field smartphone photos, and local agronomic practices. This document provides a scenario-driven threat analysis covering the 5 Threat Zones, mapping risks to concrete countermeasures.

---

## 1. Threat Summary Table (5 Threat Zones)

| Threat Zone | Specific Threat / Attack Scenario | Threat Severity | Applied Countermeasure / Technical Mitigation |
| :--- | :--- | :--- | :--- |
| **Zone 1: Input Surfaces** | Malicious / Polyglot file upload disguised as crop leaf image; decompression bomb; EXIF GPS leak. | **HIGH** | Strict MIME verification (`image/jpeg`, `image/png`), client-side and server-side memory limits (20MB), EXIF metadata stripping prior to model ingest, and base64 sanitary normalization. |
| **Zone 1: Input Surfaces** | Malformed GeoJSON (bow-tie self-intersecting polygons, inverted coordinate order, 0-area coordinates). | **MEDIUM** | Geodesic polygon validator: checks closed rings, self-intersection, coordinate bounds (WGS84 lon: [-180, 180], lat: [-90, 90]), and minimum pixel support. |
| **Zone 2: Planning & Reasoning** | Prompt injection via farmer narrative attempting to force toxic chemical dosage or extract system prompts. | **CRITICAL** | Strict system instruction hierarchy; farmer narrative is treated as **untrusted data** and isolated inside quoted delimiters. Gemini structured output schema (`responseSchema`) enforces schema adherence. |
| **Zone 2: Planning & Reasoning** | Hallucination of definitive plant pathology or guaranteed yield from weak satellite pixels or blurry photos. | **CRITICAL** | Quality gating: satellite observations <9 core pixels or <70% coverage are labeled `insufficient_evidence` and cannot trigger alerts. Model schema forces confidence level (`low`/`moderate`) and mandatory uncertainty disclosure. |
| **Zone 3: Tool Execution & SSRF** | Attacker probes external endpoints via weather or tile parameters (e.g., passing `http://169.254.169.254/`). | **HIGH** | Strict input validation for latitude/longitude as bounded floats; hardcoded trusted upstream provider domain (`api.open-meteo.com`); no dynamic URL fetching based on user-supplied strings. |
| **Zone 4: Memory & State** | Cross-tenant data leakage on shared agricultural extension tablets or multi-user farm cooperatives. | **HIGH** | Tenant-isolated storage keys; zero-shared cache without explicit authentication; Privacy Center with instant local storage purge on logout; machine-readable export with zero credential leakage. |
| **Zone 5: Inter-System Communication** | Leakage of Gemini API key, Google Cloud credentials, or internal endpoint metadata to browser. | **CRITICAL** | Server-side proxy architecture (`server.ts`). The `@google/genai` SDK is instantiated solely in Node.js runtime. Zero client-side API keys. `User-Agent: aistudio-build` telemetry header attached. |

---

## 2. Trust Boundaries & Data Flow Matrix

```
[Untrusted Farmer Browser / Mobile]
               │  (HTTPS / TLS 1.3)
               ▼
[Boundary 1: Express Server-Side Proxy (server.ts)]
   ├── Ingest: JSON parser (20MB limit) + Null-Safe Destructuring
   ├── Validator: GeoJSON geometry & image sanitary filters
   ├── Weather Adapter: Open-Meteo (sanitized lat/lon only)
   └── Gemini Orchestrator: Resilient Fallback Ladder
               │
               ├── (Encrypted gRPC / HTTPS) ──► [Boundary 2: Google Gemini Vertex AI]
               └── (HTTPS) ───────────────────► [Boundary 3: Open-Meteo Regional Weather]
```

## 3. Residual Risks & Ongoing Controls
- **Satellite Cloud Contamination**: Addressed via Scene Classification Layer (SCL) filtering (masking classes 3, 8, 9, 10, 11) and explicit `insufficient_cloud_free_pixels` state.
- **Physical Inspection Discrepancy**: Addressed via farmer feedback loops where recorded field actions confirm or refute the satellite alert.
