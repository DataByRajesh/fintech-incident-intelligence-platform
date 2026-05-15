# Demo Script

Use this script for a recruiter screen, portfolio walkthrough, or interview discussion. The goal is to show operational thinking, not to oversell the MVP as an enterprise platform.

## Opening

"This is a FinTech Operational Resilience and Incident Intelligence MVP. It models the kind of workflow an application support or business systems analyst might use when triaging incidents: intake, classification, risk scoring, SLA pressure, tracking, and stakeholder summaries."

## 1. Dashboard

Show:
- Active incidents
- Critical risk count
- SLA pressure
- Resolved/closed count
- Latest incident movement
- SLA watchlist

Talk track:
"The dashboard gives a quick operational command view. It is intentionally focused on the signals support teams care about during incident triage: what is active, what is critical, what is under SLA pressure, and what recently changed."

## 2. Add Incident

Click `+ Log incident`.

Example incident:
- Title: `Payment provider webhook timeout`
- Reported by: `Production Support`
- Description: `Provider webhook timeout is delaying payment confirmation for customers.`
- Affected service: `Payment gateway`
- Customer impact: `High`
- Financial impact: `High`
- SLA urgency: `Critical`
- System/ICT impact: `High`
- Compliance sensitivity: `Medium`
- Workaround availability: `Partial`

Talk track:
"The intake form captures business and operational impact. Required fields are validated visibly, and the dropdowns feed a local scoring model."

## 3. Classification Result

Click `Classify incident`.

Show:
- Category
- Severity
- Risk score out of 100
- SLA status
- Workflow status
- Stakeholder summary

Talk track:
"Classification is local and rule-based. The app uses keyword matching for category, weighted impact scoring for risk, and a simple SLA rule layer. The stakeholder summary turns operational facts into concise business-facing language."

## 4. Tracker

Click `Open in tracker`.

Show:
- Incident table
- Selected incident detail panel
- Risk, SLA, status badges
- Stakeholder summary

Talk track:
"The tracker is where the analyst can monitor the incident after intake. The newly classified incident appears immediately, using the same state as the dashboard and reports."

## 5. Status Update

Change the incident status, for example from `Open` to `Investigating` or `Resolved`.

Show:
- Visible success message
- Updated status badge

Talk track:
"Status updates are reflected across the app. This demonstrates the shared data flow: tracker changes update dashboard metrics and reporting summaries."

## 6. Reports

Open Reports.

Show:
- Total incidents
- Average risk score
- Escalation required count
- Closed/resolved count
- Highest risk incident
- Status distribution
- Category mix

Talk track:
"The Reports page summarizes the current incident set for stakeholders. It helps explain operational exposure by risk, SLA pressure, workflow status, and incident category."

## 7. Refresh Check

Refresh the page.

Talk track:
"The MVP uses browser localStorage for local persistence. Refresh does not break the app, and stored incidents are validated before being used. If stored data is malformed, the app falls back to demo data."

## Closing

"This is deliberately scoped as an MVP. There is no backend, database, auth, AI, or ticketing integration yet. The purpose is to demonstrate product sense, operational resilience domain awareness, React/TypeScript implementation, data-flow discipline, and interview-ready QA."
