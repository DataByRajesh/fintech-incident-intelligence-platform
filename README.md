# Fintech Incident Intelligence & Risk Operations Platform

A production-grade fintech operations demo for classifying payment incidents, assessing severity, tracking reconciliation risk, maintaining operational audit history, and preparing structured management reports for regulated banking and fintech environments.

## Live Demo

https://fintech-incident-intelligence-platf.vercel.app/

## Core Module

### Payment Incident Triage & Reconciliation Workbench

The core module supports payment incident intake, triage, severity classification, reconciliation risk tracking, SLA escalation, and structured reporting.

## Why This Project Was Built

This project was built to demonstrate practical fintech product thinking, payment operations awareness, risk workflow design, deterministic business-rule classification, and frontend MVP delivery.

It is designed as a portfolio and interview credibility project for fintech, application analyst, technical business analyst, operations, and product-focused roles.

## Core Features

- Executive risk dashboard
- Payment incident triage workbench
- Deterministic severity classification
- Reconciliation risk tracking
- SLA and escalation view
- Searchable and filterable operational incident tracker
- Status-change audit trail for incident governance
- Structured management reports with text download
- Versioned local persistence with backward-compatible data migration
- App-level recovery boundary for unexpected UI failures
- Vercel security headers and immutable asset caching
- Realistic fintech demo scenarios

## Production-Grade Controls

- **Data integrity:** incidents are normalized on load, persisted with a versioned storage contract, and protected from malformed local data.
- **Governance:** each incident records creation and status-change audit entries with actor, status, note, and timestamp.
- **Operational usability:** tracker users can search by reference, category, payment rail, service, or owner and filter by status or risk.
- **Reporting:** management summaries can be downloaded as a lightweight `.txt` report for review or handoff.
- **Resilience:** an application recovery boundary prevents a single render failure from leaving the workspace blank.
- **Deployment hardening:** `vercel.json` applies CSP, frame protection, referrer policy, permissions policy, and long-lived cache headers for built assets.

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Vitest and Testing Library
- Vercel
- Local demo data

## Quality Checks

```bash
pnpm test:run
pnpm build
```

## Demo Data Disclaimer

Demo system only. No real customer, transaction, or banking data is used.
