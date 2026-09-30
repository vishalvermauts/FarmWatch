# Security Policy & Hardening Standards — FarmWatch

## 1. Authentication & Tenant Authorization Model
- **User Identity**: Scoped to authenticated user IDs (`uid`). Browser-supplied user IDs in request bodies are never trusted for authorization; caller identity is verified server-side.
- **Data Isolation**: All farm records, field geometries, crop season parameters, and advisory histories are isolated by user context.
- **Role-Based Access Control**:
  - `Farmer / Owner`: Full CRUD rights over owned fields, media, and recorded actions.
  - `Extension Officer`: Read-only access granted strictly through explicit, revocable sharing tokens.
  - `Operations Admin`: System health metadata only; zero access to private farm geometries or smartphone photos.

## 2. Secret Management & Zero-Hardcoding Hygiene
- **Zero API Key Leakage**: No API keys, credentials, or tokens are ever embedded in client JavaScript bundles or committed to source repositories.
- **Server Injection**: Operational credentials (`GEMINI_API_KEY`) are injected via environment variables or Google Cloud Secret Manager.
- **Google Cloud Secret Manager Binding**:
  ```bash
  gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
  echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
  gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
    --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
  ```

## 3. Prompt Injection Defense (OWASP LLM01 / LLM02)
- **Delimited Untrusted Context**: Farmer narrative notes, uploaded soil reports, and external web payloads are treated as unverified data. They are explicitly encapsulated in data blocks and never parsed as executive directives.
- **Schema-Constrained Generation**: Output structure is strictly enforced by `@google/genai` JSON schema parameters, preventing arbitrary tool execution or jailbreak code generation.
- **Forbidden Advice Guardrails**:
  - Prohibits synthetic chemical dosage prescriptions.
  - Prohibits definitive disease diagnoses from photographic evidence alone.
  - Mandates clear uncertainty statements on all advisory outputs.

## 4. Firestore & Database Security Rules
When deploying to Firestore, FarmWatch enforces owner-bound path security:
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

## 5. Vulnerability Disclosure & Audit
To report security concerns, email the agricultural technology team with detailed reproduction steps. All cryptographic keys, database leases, and session tokens adhere to industry-standard rotation schedules.
