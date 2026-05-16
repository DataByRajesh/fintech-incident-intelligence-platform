# Fintech Incident Intelligence & Risk Operations Platform

Live demo: https://fintech-incident-intelligence-platf.vercel.app/

A frontend-only React + TypeScript MVP for fintech incident triage, payment operations awareness, reconciliation risk handling, SLA escalation, and structured management reporting.

## Why This Project Was Built

Fintech teams need to understand payment incidents quickly: what failed, which rail is affected, how many customers and transactions are exposed, whether money movement or reconciliation is at risk, and what needs to be escalated.

This project was built as a practical portfolio MVP to demonstrate analyst-style thinking across incident intake, deterministic classification, operational risk scoring, reconciliation prioritisation, and stakeholder-ready reporting.

## Core Modules

1. Executive Risk Dashboard
2. Payment Incident Triage & Reconciliation Workbench
3. Incident Classification Engine
4. Operational Risk Tracker
5. Reconciliation Risk View
6. SLA & Escalation View
7. Structured Reports
8. Demo Governance / Disclaimer

## Current Features

- Executive dashboard with total incidents, critical/high risk, open items, SLA risk, reconciliation breaks, estimated exposure, affected customers, and recent high-risk incidents
- Workbench for payment incident intake and reconciliation context
- Deterministic classification engine using local rules
- Severity and risk scoring based on financial impact, affected customers, transaction count, SLA risk, regulatory/customer impact, and incident category
- Recommended action, escalation requirement, reconciliation priority, and reporting note for each incident
- Operational risk tracker with status updates
- Reconciliation Risk View and SLA & Escalation View
- Structured management reports covering operational summary, severity breakdown, reconciliation summary, customer impact, financial exposure, management update, and next steps
- Realistic demo scenarios for Faster Payments, card reconciliation, duplicate debit, Open Banking, chargebacks, BACS, suspicious transactions, CHAPS, SEPA, and SWIFT
- Browser `localStorage` persistence with safe fallback to demo data

## Tech Stack

- Vite
- React
- TypeScript
- CSS
- Local deterministic rule engine
- Demo data
- Browser `localStorage`

No backend, authentication, database, real banking data, or external paid APIs are used.

## Demo Data Disclaimer

Demo system only. No real customer, transaction, or banking data is used.

Built as a practical MVP to demonstrate fintech incident triage, payment operations awareness, reconciliation risk handling, and structured reporting for regulated environments.

RCA hypotheses and recommended actions are illustrative investigation prompts, not confirmed operational findings.

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

## Portfolio / Interview Positioning

This project is designed for Application Analyst, Technical Business Analyst, Business Systems Analyst, Production Support Analyst, FinTech Systems Analyst, and Technical Solutions Consultant interviews.

It demonstrates:

- Payment operations domain awareness
- Reconciliation risk thinking
- SLA and escalation prioritisation
- Business impact analysis
- Structured stakeholder communication
- Frontend implementation with React and TypeScript
- Explainable rule-based decision logic

Suggested interview summary:

"I built this as a fintech incident intelligence and risk operations MVP. It shows how a payment incident can move from intake into classification, risk scoring, reconciliation prioritisation, operational tracking, and structured management reporting. It is intentionally frontend-only with deterministic rules and demo data, so the business logic is transparent and easy to explain."

## Future Improvements

- Audit trail for status changes
- Time-based SLA countdowns
- Exportable management reports
- Optional charting for trend analysis
- Optional AI-assisted classification with human confirmation
- Jira or ServiceNow handoff simulation
- Backend persistence as a future production extension
- Role-based access as a future production extension
