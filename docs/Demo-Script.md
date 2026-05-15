# Demo Script

This script is designed for a 2-minute recruiter screen or a short interview walkthrough.

## 2-Minute Recruiter Demo

### 0:00 - 0:20: Open With Context

"This is a FinTech Operational Resilience and Incident Intelligence MVP. I built it to demonstrate application support, incident triage, SLA and risk thinking, business impact analysis, and stakeholder communication."

"It is intentionally scoped as a front-end MVP using React, TypeScript, local rules, and demo incident data."

### 0:20 - 0:40: Dashboard

Show the Dashboard.

Say:
"The dashboard gives an operational command view: active incidents, critical risk, SLA pressure, resolved or closed work, latest movement, and SLA watchlist items. This is the kind of summary an application analyst or production support analyst would need during live triage."

### 0:40 - 1:05: Add Incident

Click `+ Log incident`.

Use this example:

- Title: `Customer charged but order not confirmed`
- Reported by: `Customer Operations`
- Description: `A checkout payment completed but the order confirmation was not created for the customer.`
- Affected service: `Checkout payments`
- Customer impact: `High`
- Financial impact: `High`
- SLA urgency: `High`
- System/ICT impact: `Medium`
- Compliance sensitivity: `Medium`
- Workaround availability: `Partial`

Say:
"The form captures both the incident facts and the business impact dimensions. Required fields are validated, and the impact selections feed the local risk model."

### 1:05 - 1:30: Classification Result

Click `Classify incident`.

Show:
- Category
- Severity
- Risk score
- SLA status
- Stakeholder summary

Say:
"The classification is local and explainable. The app uses keyword rules to assign a category, then calculates a weighted risk score out of 100. Severity translates that score into an operational label. SLA status is generated from urgency and risk, so the user can quickly see whether escalation is needed."

### 1:30 - 1:45: Stakeholder Summary

Point to the summary.

Say:
"The stakeholder summary turns technical and operational inputs into concise business language. It explains the affected service, risk level, SLA position, customer impact, financial impact, workaround status, and recommended action."

### 1:45 - 2:00: Tracker And Reports

Click `Open in tracker`, update the status, then open Reports if time allows.

Say:
"Once the incident is logged, it appears in the tracker. Updating status refreshes the shared app state, so the dashboard and reports stay aligned. This demonstrates the data flow across triage, tracking, and reporting."

## How To Explain Key Concepts

### Severity

"Severity is the operational label derived from the calculated risk score. It helps teams quickly understand how serious the incident is."

### Risk Score

"Risk is calculated out of 100 using weighted factors: customer impact, financial impact, SLA urgency, system impact, compliance sensitivity, and workaround availability. This makes the triage decision transparent rather than hidden."

### SLA Status

"SLA status is generated from the urgency and risk score. It tells the team whether the incident is on track, at risk, breached, or requires escalation."

### Stakeholder Summary

"The stakeholder summary is designed for non-technical stakeholders. It converts the incident details into clear business impact language and recommends the next operational action."

## Closing Line

"This is not intended to replace enterprise tools. It is a focused MVP showing that I understand FinTech incident workflows, operational resilience, application support priorities, and stakeholder communication."
