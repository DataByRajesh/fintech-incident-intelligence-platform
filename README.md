# FinTech Operational Resilience & Incident Intelligence Platform

A polished recruiter/interview MVP for FinTech application support and business systems roles. The platform helps operational teams log incidents, classify them with local rules, calculate risk, monitor SLA pressure, and generate stakeholder-ready summaries.

## Target Roles

- FinTech Application Analyst
- Technical Business Analyst
- Business Systems Analyst
- FinTech Systems Analyst
- Production Support Analyst
- Technical Solutions Consultant

## Demo Flow

1. Open the dashboard.
2. Log a new operational incident.
3. Review the rule-based classification result.
4. Inspect the risk score, SLA status, severity, and stakeholder summary.
5. Open the incident in the tracker.
6. Update the incident status.
7. Confirm dashboard and reports update from the same local incident state.

## MVP Features

- Dashboard with active incident, risk, SLA, and resolution metrics
- Add Incident form with visible validation feedback
- Local rule-based incident classification
- Weighted risk scoring out of 100
- SLA status generation
- Stakeholder summary generation
- Incident tracker with details panel
- Status updates across the app
- Reports view for risk, SLA, status, and category distribution
- Seeded demo incidents for interview walkthroughs

## Tech Stack

- Vite
- React
- TypeScript
- Custom CSS
- Browser localStorage

No AI, authentication, database, API backend, Jira/ServiceNow integration, or payment processing is included.

## Risk Scoring Model

Risk score is calculated out of 100 using:

- Customer impact: 20%
- Financial impact: 20%
- SLA urgency: 20%
- System/ICT impact: 15%
- Compliance sensitivity: 15%
- Workaround availability: 10%

Risk labels:

- 0-30: Low
- 31-60: Medium
- 61-80: High
- 81-100: Critical

## Local Setup

```powershell
pnpm install
pnpm run dev
```

Production build check:

```powershell
pnpm run build
```
