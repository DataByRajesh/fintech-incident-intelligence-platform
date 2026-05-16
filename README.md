# FinTech Operational Resilience & Incident Intelligence Platform

A recruiter-ready Vite + React + TypeScript MVP for FinTech incident triage, business impact reasoning, SLA/risk prioritisation, investigation playbooks, stakeholder communication, and repeated incident pattern analysis.

## Why This Project Matters

Operational resilience is a core FinTech concern. Support and business systems teams need to understand what happened, who is affected, how severe the risk is, whether SLA pressure exists, and how to communicate clearly with stakeholders.

This project turns that workflow into a focused MVP: log an incident, classify it with local rules, calculate risk, generate an SLA status, explain business impact, suggest investigation steps, draft stakeholder updates, track workflow status, and identify repeated incident patterns.

## Target Roles

- Application Analyst
- Technical Business Analyst
- Business Systems Analyst
- FinTech Systems Analyst
- Production Support Analyst
- Technical Solutions Consultant

## Core Features

- Dashboard with active incident, risk, SLA, and resolution metrics
- Add Incident form with required-field validation
- Local rule-based incident classification
- Weighted risk scoring out of 100
- SLA status generation
- Severity and risk labels
- Stakeholder-ready summary generation
- Business impact reasoning for every classified incident
- Category-specific investigation playbooks
- Possible root cause hypotheses framed as investigation prompts
- Plain-English stakeholder update drafts
- Incident tracker with selected incident details
- Status updates with visible feedback
- Reports page for incident totals, status distribution, category mix, highest-risk incident, and repeated category patterns
- Demo incident data for interview walkthroughs
- Browser `localStorage` persistence with defensive fallback to demo data

## MVP Flow

1. Open the Dashboard.
2. Review demo incidents and current operational metrics.
3. Click `+ Log incident`.
4. Enter an incident and impact details.
5. Submit for local classification.
6. Review category, severity, risk score, SLA status, stakeholder summary, business impact reasoning, playbook, RCA hypotheses, and stakeholder update draft.
7. Open the incident in the tracker.
8. Update workflow status.
9. Confirm Dashboard and Reports reflect the latest incident data and repeated category insights.

## Tech Stack

- Vite
- React
- TypeScript
- CSS
- Local rule-based classification
- Demo incident data
- Browser `localStorage`

No AI, authentication, database, backend API, Jira integration, ServiceNow integration, or payment processing is included in V1.

## Project Docs

- [MVP Test Plan](docs/MVP-Test-Plan.md)
- [Demo Script](docs/Demo-Script.md)
- [Project Positioning](docs/Project-Positioning.md)
- [Technical Architecture](docs/Technical-Architecture.md)

## How To Run Locally

Install dependencies:

```powershell
pnpm install
```

Start the dev server:

```powershell
pnpm run dev
```

Run a production build check:

```powershell
pnpm run build
```

## Demo Scenarios

### Scenario 1: Customer Charged But Order Not Confirmed

Use this to show payment operations thinking:

- Title: `Customer charged but order not confirmed`
- Reported by: `Customer Operations`
- Affected service: `Checkout payments`
- Description: `A checkout payment completed but the order confirmation was not created for the customer.`

Explain how the app classifies the incident, calculates risk, assigns SLA pressure, and produces a stakeholder summary.
Also show how the business impact reasoning justifies priority and how the investigation playbook guides the next steps.

### Scenario 2: Provider API Timeout

Use this to show production support triage:

- Title: `Payment provider API timeout`
- Reported by: `Production Support`
- Affected service: `Payment gateway`
- Description: `Provider API timeout is causing intermittent payment authorisation failures.`

Explain service impact, customer disruption, financial exposure, and escalation handling.
Use this scenario to discuss possible causes to investigate, without claiming the app knows the actual root cause.

### Scenario 3: Reconciliation Mismatch

Use this to show business systems analysis:

- Title: `Reconciliation mismatch between ledger and provider`
- Reported by: `Finance Operations`
- Affected service: `Reconciliation`
- Description: `Daily reconciliation found a mismatch between internal ledger and payment provider settlement totals.`

Explain financial impact, operational controls, and stakeholder communication.
Use this scenario to show repeated pattern analysis if multiple reconciliation or transaction incidents exist.

## Risk Scoring Model

Risk is calculated out of 100 using weighted inputs:

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

## Limitations Of V1

- Data is stored locally in the browser.
- There is no backend database.
- There is no multi-user workflow.
- SLA status is rule-based, not timer-based.
- Classification is keyword-based and intentionally explainable.
- RCA hypotheses are prompts for investigation, not confirmed root causes.
- There is no audit history.
- There is no ticketing platform integration.
- There is no automated test suite yet.

## Future Improvements

- Backend persistence
- Audit trail for status changes
- Time-based SLA timers
- Exportable stakeholder reports
- Role-based access
- Jira or ServiceNow integration
- Automated test coverage
- Optional AI-assisted classification as a future extension

## Interview Explanation

"I built this as a FinTech operational resilience MVP. It demonstrates how an analyst or support team can turn an incident report into structured triage: classification, business impact reasoning, risk scoring, SLA prioritisation, investigation playbooks, workflow tracking, stakeholder communication, and repeated incident pattern analysis. It is intentionally scoped as a front-end MVP with local rules and demo data, so the business logic is transparent and easy to explain in an interview."
