# FarmWatch — Evidence-Grounded Agricultural Inspection Platform

FarmWatch empowers farmers and agricultural cooperatives to inspect possible crop stress using dated satellite observations, regional weather context, crop season parameters, and smartphone photo evidence. It guides grounded physical field inspection; it does not provide definitive lab diagnoses, synthetic chemical dosage prescriptions, or guaranteed yield claims.

---

## 1. Challenge & Provenance Disclosure

### A. What Was in the Starter Template
- Minimal Vite + React skeleton (`src/App.tsx`).
- Baseline Tailwind configuration and empty metadata placeholders.

### B. What Has Been Independently Built & Architected
- **Deterministic Sentinel-2 L2A Pipeline**: Mathematical NDVI ($B_8, B_4$) and NDMI ($B_8, B_{11}$) calculation on a 20m aligned grid, 10m inward core buffer erosion, SCL cloud/shadow filtering, and 9-pixel / 70% core coverage support gating.
- **Resilient Google AI Multimodal Engine**: Server-side `@google/genai` integration with an automated 5-model fallback ladder (`gemini-3.8-flash` → `gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`), structured Schema v1 validation, prompt injection defense, and allowlisted ICAR/IMD reference grounding.
- **Real-Time Weather Context**: Live Open-Meteo API integration delivering 7-day precipitation, temperature ranges, and relative humidity with explicit regional grid labeling.
- **Interactive GIS Boundary Editor**: Precision vector drawing canvas, GeoJSON import/export, geodesic area calculation in hectares, and multi-band false color toggling (NDVI greenness, NDMI moisture, TrueColor).
- **Bilingual Accessible Interface**: Native English and Hindi (हिन्दी) support, zero-pill typography, tabular figures, and full keyboard/screen-reader accessibility (WCAG AA).
- **Privacy Center & Data Export**: Machine-readable JSON and human-readable Markdown exports, client-side offline summary caching, and one-click data purge.

---

## 2. Evaluation Dimension Mapping

| Dimension | Implementation Details |
| :--- | :--- |
| **Authenticity** | Uses verified mathematical formulas from Copernicus Sentinel-2 L2A (10m red/NIR, 20m SWIR/SCL) and real-time Open-Meteo forecasts. All AI advice cites verified Indian agronomic bulletins (IMD Agromet & ICAR CRIDA). |
| **Usability** | Dual-language interface (EN / HI) designed for mobile field use and desktop extension consoles. Follows strict zero-pill aesthetic rules, clear unboxed metadata with `·` separators, and accessible contrast. |
| **Stability** | Automated model fallback ladder catches 503, 429, 404, 500 status codes. Top-level body parsing guarantees defensive payload ingestion. Graceful AI degradation ensures user notes and measurements are never lost if external APIs fail. |
| **Security** | Zero client-side API keys. Strict prompt injection boundary treating farmer input as untrusted data. Geodesic geometry sanitization. Machine-readable export with zero credential exposure. |

---

## 3. Google Cloud Run Deployment Guide

### Prerequisites
1. Install the Google Cloud SDK (`gcloud` CLI).
2. Set your Google Cloud project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Enable necessary Google Cloud APIs:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     cloudbuild.googleapis.com
   ```

### Step 1: Secret Manager Setup
Store your Gemini API key in Secret Manager:
```bash
# Create the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Inject the secret value
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Secret Accessor role to the default Cloud Run runtime service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 2: Firestore Database & Security Rules
Provision Cloud Firestore in Native mode. Deploy the owner-bound security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/fields/{fieldId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/observations/{obsId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/advisories/{advisoryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/actions/{actionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 3: Cloud Run Deployment
Deploy the full-stack container directly to Cloud Run:
```bash
gcloud run deploy farmwatch \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production,PORT=8080"
```

### Step 4: Mandatory Challenge Verification Label
Apply the required campaign resource label to register the service for automated verification:
```bash
gcloud run services update farmwatch \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 4. Local Development Walkthrough & Testing

### Running Locally
```bash
# Install dependencies
npm install

# Start unified full-stack server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Walkthrough Guide
1. **Field & Boundary Setup**:
   - Navigate to **Fields & Map**.
   - Click **Draw New Boundary** or **Load Demo Field** (Nashik Vineyard & Wheat Plot, 0.85 ha).
   - Observe live geodesic area calculation and the 10m inward core buffer display.
2. **Satellite Time Series & Quality Inspection**:
   - Inspect the 6 chronological observations.
   - Switch between **NDVI Greenness**, **NDMI Canopy Moisture**, and **True Color**.
   - Observe the cloudy pass showing the truthful `insufficient_cloud_free_pixels` state.
   - Observe the candidate change alert triggered on the final observation (>0.15 absolute drop, >20% relative fall vs baseline).
3. **Multimodal AI Crop Assessment**:
   - Navigate to **Evidence & AI**.
   - Select the preset field photo (Leaf-tip moisture scorch) or upload your own.
   - Click **Run Multimodal Crop Assessment**.
   - Review the structured Schema v1 advisory: visible symptoms, differential causes, clarifying questions, physical inspection checklist, and cited ICAR/IMD regenerative guidance.
   - Ask follow-up questions in English or Hindi via the interactive advisory chat.
4. **Action Log & Ground-Truth Feedback**:
   - Record a physical scouting inspection (e.g., "Inspected drip laterals, unclogged drippers 14-18").
   - Mark whether the satellite alert was confirmed or refuted.
5. **Privacy Center & Data Export**:
   - Navigate to **Privacy Center**.
   - Download the full data export in machine-readable JSON or human-readable Markdown.
   - Test the local cache purge with confirmation.

---

## 5. Architectural Documentation Index
- [Threat Model (5 Threat Zones)](docs/THREAT_MODEL.md)
- [System Architecture & Flow Diagrams](docs/ARCHITECTURE.md)
- [Security & Hardening Standards](docs/SECURITY.md)
