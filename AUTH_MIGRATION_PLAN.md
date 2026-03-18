# Auth Migration Plan (Cookie-First)

## Current state
- Backend supports access + refresh cookies, session rotation, OAuth, and OTP.
- Frontend is now migrated to cookie-based auth and no longer stores auth tokens in localStorage.
- Backend still returns backward-compatible fields (`token`, `user`) for legacy clients.

## Phase 1: Safe rollout (now)
1. Deploy backend + frontend together.
2. Verify frontend uses `withCredentials: true` and backend CORS allows credentials for production origins.
3. Keep backward-compatible response fields enabled on backend.
4. Monitor login, OTP verify, Google login callback, protected route navigation, and logout.

## Phase 2: Stabilize and observe
1. Track auth API metrics:
   - `POST /api/auth/login`
   - `POST /api/auth/refresh-token`
   - `GET /api/auth/me`
   - `POST /api/auth/logout`
2. Monitor refresh-token reuse detection and session revocation rates.
3. Validate multi-device behavior:
   - independent session creation
   - single-session revoke
   - logout-all

## Phase 3: Legacy cleanup
1. Remove frontend logic that depends on query token parameters in Google callback responses.
2. Remove backend root-level legacy fields (`token`, `user`) once all active clients consume `data` format.
3. Enforce secure cookie mode in production (`Secure=true`, `SameSite=None`) and HTTPS-only traffic.

## Phase 4: Hardening
1. Add CSRF protection for cookie-authenticated state-changing routes.
2. Add server-side session/device dashboard in UI (already supported by backend endpoints).
3. Add E2E tests for:
   - login + protected route access
   - access token expiry + refresh rotation
   - logout + logout-all
   - Google OAuth callback and OTP flow

## Rollback strategy
1. Keep backend compatibility fields for one release cycle.
2. If issues appear, keep cookie auth active but temporarily allow legacy frontend behavior while patching UI.
3. Roll forward with monitored hotfixes instead of reverting security changes.
