# Technical Architecture

## Overview

The platform is a front-end MVP built with Vite, React, TypeScript, CSS, local rule-based classification, and demo incident data. It has no backend, database, auth layer, AI service, or external ticketing integration in V1.

The architecture is intentionally simple so the triage workflow is transparent and easy to explain in interviews.

## App Structure

```text
src/
  App.tsx
  main.tsx
  components/
    AddIncidentForm.tsx
    Badges.tsx
    ClassificationResult.tsx
    Dashboard.tsx
    IncidentTracker.tsx
    Reports.tsx
  data/
    demoIncidents.ts
  logic/
    incidentRules.ts
  types/
    incident.ts
  styles.css
```

## Component Structure

### `App.tsx`

Owns the main application state:

- Current screen
- Incident collection
- Latest classified incident
- Selected tracker incident
- User notices and persistence warnings

It passes incidents and handlers into child components.

### `Dashboard.tsx`

Displays operational metrics:

- Active incidents
- Critical risk count
- SLA pressure
- Resolved/closed count
- Latest incident movement
- SLA watchlist

### `AddIncidentForm.tsx`

Captures incident details and impact inputs. It validates required fields before allowing classification.

### `ClassificationResult.tsx`

Shows the output of the local rule engine:

- Category
- Severity
- Risk score
- SLA status
- Workflow status
- Stakeholder summary

### `IncidentTracker.tsx`

Displays all incidents, selected incident details, and workflow status updates.

### `Reports.tsx`

Summarizes the current incident set:

- Total incidents
- Average risk score
- Escalation required count
- Closed/resolved count
- Highest-risk incident
- Status distribution
- Category mix

### `Badges.tsx`

Provides reusable visual labels for risk, severity, SLA status, and workflow status.

## Data Flow

1. Demo incidents are created from `demoIncidents.ts`.
2. `App.tsx` loads saved incidents from `localStorage` if valid.
3. If saved data is missing or invalid, the app falls back to demo incidents.
4. User submits an incident through `AddIncidentForm`.
5. `createIncident` in `incidentRules.ts` classifies and scores the incident.
6. `App.tsx` prepends the new incident to state.
7. Dashboard, Tracker, Classification Result, and Reports read from the same incident state.
8. Tracker status updates modify the same incident collection.
9. Updated incidents are saved back to `localStorage`.

## Incident Type Model

The core `Incident` type includes:

- `id`
- `reference`
- `title`
- `description`
- `reportedBy`
- `affectedService`
- Customer, financial, SLA, system, compliance, and workaround impact inputs
- `category`
- `severity`
- `riskScore`
- `riskLabel`
- `slaStatus`
- `status`
- `stakeholderSummary`
- `createdAt`
- `updatedAt`

Supporting union types define valid values for:

- Incident status
- Severity
- Risk label
- SLA status
- Incident category
- Impact level
- Workaround availability

## Triage Rule Engine

The local rule engine lives in `src/logic/incidentRules.ts`.

It handles:

- Keyword-based incident classification
- Weighted risk score calculation
- Risk label assignment
- Severity assignment
- SLA status calculation
- Stakeholder summary generation
- Incident object creation

The risk score is calculated out of 100 using:

- Customer impact: 20%
- Financial impact: 20%
- SLA urgency: 20%
- System/ICT impact: 15%
- Compliance sensitivity: 15%
- Workaround availability: 10%

This keeps the scoring transparent and explainable for interview discussion.

## Demo Data

`src/data/demoIncidents.ts` contains seeded incident drafts for common FinTech scenarios:

- Payment failure
- Payment provider API timeout
- KYC/account access issue
- Reconciliation mismatch
- Pending transaction delay
- Card transaction failure
- Merchant payout delay
- Core banking balance sync issue

Demo incidents are generated through the same `createIncident` function used by user-submitted incidents, so demo data follows the same classification and scoring rules.

## Current Storage Approach

The MVP uses browser `localStorage`.

Current behavior:

- Incidents are saved locally after state changes.
- Refresh restores saved incidents.
- Invalid stored data falls back to demo incidents.
- Persistence failures show a visible warning.

This is suitable for a local recruiter demo, but not for production use.

## Future Backend / AI Extension Path

Future backend path:

- Replace `localStorage` with an API-backed data store.
- Persist incidents, status history, and audit events.
- Add user roles and permissions.
- Add exportable stakeholder reports.
- Add Jira or ServiceNow integration.

Future AI path:

- Keep local rules as a transparent baseline.
- Add optional AI-assisted classification suggestions.
- Compare AI suggestions against rule-based output.
- Require user confirmation before applying AI-generated classification or summaries.

The current MVP is intentionally built so these extensions can be added later without changing the core demo story.
