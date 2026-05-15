# MVP Test Plan

This test plan verifies the FinTech Operational Resilience & Incident Intelligence Platform MVP for recruiter demos and interview walkthroughs. It focuses on stability, data flow, validation, and silent-failure prevention.

## Test Environment

- Browser: Chrome or Edge
- App runtime: Vite dev server
- Start command: `pnpm run dev`
- Build check: `pnpm run build`
- Data source: demo incidents plus browser `localStorage`

## Dashboard Tests

### Dashboard Loads

Steps:
- Start the app.
- Open the local Vite URL.

Expected:
- Dashboard is the first screen.
- Header and navigation render.
- Metric cards display active incidents, critical risk, SLA pressure, and resolved/closed totals.
- Latest incident movement displays demo incidents.
- SLA watchlist displays incidents that are not `On Track`.

### Dashboard Navigation

Steps:
- Click `+ Log incident`.
- Click `View tracker`.
- Click `Open reports`.

Expected:
- Each button navigates to the correct screen.
- No button fails silently.
- Navigation does not create console errors.

## Add Incident Tests

### Required Field Validation

Steps:
- Open Add Incident.
- Leave title, description, reported by, or affected service blank.

Expected:
- `Classify incident` remains disabled.
- A visible disabled reason explains what is required.

### Successful Incident Intake

Steps:
- Enter a valid incident.
- Select impact values.
- Click `Classify incident`.

Expected:
- Form submits successfully.
- New incident is created.
- User is taken to Classification Result.

## Classification Result Tests

### Classification Output

Steps:
- Submit an incident such as `Customer charged but order not confirmed`.

Expected:
- Category is generated from local rules.
- Severity is displayed.
- Risk score appears out of 100.
- SLA status is displayed.
- Workflow status starts as `Open`.
- Stakeholder summary is generated.

### Result Actions

Steps:
- Click `Open in tracker`.
- Click `Add another incident`.
- Click `Return to dashboard`.

Expected:
- Each action navigates correctly.
- No action fails silently.

## Tracker Tests

### Incident List

Steps:
- Open Incident Tracker.

Expected:
- Demo incidents display in the table.
- New incidents appear after classification.
- Selecting a row updates the detail panel.

### Keyboard Selection

Steps:
- Focus a tracker row.
- Press Enter.
- Press Space.

Expected:
- Row selection works with keyboard input.
- Page does not unexpectedly scroll on Space selection.

### Empty State

Expected if no incidents are available:
- Tracker shows a clear empty-state message.
- Details panel explains that an incident is needed before status updates.

## Status Update Tests

### Status Change

Steps:
- Select an incident.
- Change status from `Open` to `Investigating`, `Resolved`, or another status.

Expected:
- Status changes visibly.
- Success message appears.
- Dashboard metrics update where applicable.
- Reports status distribution updates.

### Same Status Selection

Steps:
- Select the current status again.

Expected:
- User receives visible feedback that the incident is already marked with that status.
- No silent no-op occurs.

## Reports Tests

### Summary Metrics

Steps:
- Open Reports.

Expected:
- Total incidents matches current incident count.
- Average risk score is calculated from current incidents.
- Escalation required count matches incidents with SLA status `Escalation Required`.
- Closed/resolved count matches incidents with status `Closed` or `Resolved`.

### Distribution Views

Expected:
- Status distribution reflects current statuses.
- Category mix reflects current incident categories.
- Highest-risk incident displays the incident with the largest risk score.
- Empty report sections show clear fallback copy if no data exists.

## localStorage / Persistence Tests

### Refresh Persistence

Steps:
- Add an incident.
- Update its status.
- Refresh the page.

Expected:
- App reloads without breaking.
- Saved incidents restore from `localStorage`.
- Updated status remains visible.

### Invalid Storage Fallback

Steps:
- Set malformed data in `localStorage`.
- Refresh the app.

Expected:
- App does not crash.
- Demo incidents load as fallback.
- No console errors appear.

## Silent Failure Checks

Every user action must meet one of these outcomes:

- Complete successfully with visible UI change or feedback.
- Show a clear error or warning message.
- Be disabled with a visible reason.

Check:
- Navigation buttons
- Dashboard action buttons
- Add Incident form submission
- Classification Result actions
- Tracker row selection
- Tracker status dropdown
- Reports navigation

Expected:
- No clickable button does nothing silently.
- No action causes a blank screen.
- No action creates an uncaught console error.

## Build And Console Checks

Run:

```powershell
pnpm run build
```

Expected:
- TypeScript build succeeds.
- Vite production build succeeds.
- Core browser flow runs without console errors.
