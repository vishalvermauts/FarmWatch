## 2026-10-13 - [CRITICAL] Fix SSRF in GEE Tile Proxy
**Vulnerability:** Server-Side Request Forgery (SSRF) and potential Path Traversal in `/api/satellite/tile` endpoint via `mapName`, `x`, `y`, `z` parameters.
**Learning:** Checking for `startsWith('http')` on user-supplied input to dynamically construct upstream API URLs is dangerous, as it allows attackers to bypass the intended target host entirely.
**Prevention:** Never trust user input for URL construction. Hardcode the base URL for upstream services and strictly validate path segments (e.g., using regex for numeric coordinate parameters) and sanitize inputs against path traversal sequences (`..`).
