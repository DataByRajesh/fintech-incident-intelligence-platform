# MVP Test Plan

This test plan verifies the current Vite + React + TypeScript MVP for stability, data flow, and demo readiness. It intentionally excludes auth, AI, database, backend APIs, and new product scope.

## Test Environment

- Browser: Chrome or Edge
- Runtime: local Vite dev server
- Command: `pnpm run dev`
- Build check: `pnpm run build`
- Data source: seeded demo incidents plus browser `localStorage`

## Acceptance Criteria

1. Dashboard loads.
2. Demo incidents display.
3. User can add an incident.
4. Local rule-based classification works.
5. Risk score is calculated out of 100.
6. SLA status is generated.
7. Stakeholder summary is generated.
8. Incident appears in tracker.
9. User can update incident status.
10. Dashboard metrics update after changes.
11. Reports page reflects current incident data.
12. No button fails silently.
13. No console errors during core flow.

## Core Flow Tests

### 1. Dashboard Load

Steps:
- Start the app.
- Open the local Vite URL.
- Confirm the Dashboard screen is visible.

Expected:
- Header and navigation render.
- Dashboard metric cards render.
- Latest incident movement and SLA watchlist show demo incidents.
- No console errors appear.

### 2. Add Incident Validation

Steps:
- Click `+ Log incident`.
- Leave required text fields empty.

Expected:
- `Classify incident` remains disabled.
- A visible reason explains that required incident details are needed.
- No silent failure occurs.

### 3. Incident Classification

Steps:
- Complete incident title, description, reported by, and affected service.
- Keep or adjust impact dropdowns.
- Click `Classify incident`.

Expected:
- Classification Result screen opens.
- Category is generated from local keyword rules.
- Risk score displays as `/100`.
- Severity, SLA status, workflow status, and stakeholder summary display.

### 4. Tracker Appearance

Steps:
- Click `Open in tracker`.

Expected:
- New incident appears at the top of the tracker.
- Details panel shows the selected incident.
- Status dropdown is visible.

### 5. Status Update

Steps:
- Change status from `Open` to another value.

Expected:
- A visible success message appears.
- The selected incident status updates in the tracker.
- Returning to Dashboard shows updated active/resolved metrics where applicable.
- Reports status distribution reflects the same data.

### 6. Reports Summary

Steps:
- Open Reports.

Expected:
- Total incidents matches current incident count.
- Average risk score is calculated from current incidents.
- Escalation required count matches incidents with SLA status `Escalation Required`.
- Closed/resolved count matches incidents with status `Closed` or `Resolved`.
- Status distribution and category mix reflect current data.

### 7. Refresh Persistence

Steps:
- Add an incident.
- Update its status.
- Refresh the browser.

Expected:
- App reloads without breaking.
- Saved incidents are restored from `localStorage`.
- If stored data is invalid, the app falls back to demo incidents.

### 8. Silent Failure Sweep

Steps:
- Click each navigation and action button.
- Use tracker row keyboard selection with Enter and Space.
- Try selecting the same status again.

Expected:
- Every action either completes visibly, shows feedback, or is disabled with a reason.
- No clickable button does nothing silently.

## Console Check

Steps:
- Open browser DevTools.
- Run the core flow from Dashboard through Reports.

Expected:
- No uncaught runtime errors.
- No Vite overlay.

## Build Check

Command:

```powershell
pnpm run build
```

Expected:
- TypeScript build succeeds.
- Vite production build succeeds.

## Known Limits

- Data is local to the browser.
- Clearing browser storage resets the app to demo incidents.
- No server-side persistence exists in this MVP.
- No automated test suite is currently included.
