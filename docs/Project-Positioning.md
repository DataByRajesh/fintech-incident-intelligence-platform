# Project Positioning

## One-Line Summary

A React + TypeScript MVP that helps FinTech support and operations teams log incidents, classify impact, calculate risk, monitor SLA pressure, and generate stakeholder-ready summaries.

## Why This Project Exists

The project is designed as a career-proof portfolio MVP for roles that sit between technology, operations, and business stakeholders. It demonstrates practical incident management thinking without requiring a full enterprise stack.

## Target Roles

- FinTech Application Analyst
- Technical Business Analyst
- Business Systems Analyst
- FinTech Systems Analyst
- Production Support Analyst
- Technical Solutions Consultant

## What It Demonstrates

- React and TypeScript implementation
- Local state management across dashboard, tracker, and reports
- Form validation and user feedback
- Rule-based classification
- Weighted risk scoring
- SLA status calculation
- Stakeholder communication
- QA discipline around silent failures, refresh behavior, and console errors

## MVP Scope

Included:
- Dashboard
- Incident intake
- Rule-based classification
- Risk score out of 100
- SLA status
- Stakeholder summary
- Incident tracker
- Status updates
- Reports view
- Demo data
- Browser localStorage persistence

Excluded:
- AI classification
- Authentication
- Database
- Backend API
- Jira or ServiceNow integration
- User roles or permissions
- Production monitoring
- Payment processing

## Business Framing

FinTech teams need to understand incident impact quickly: customer exposure, financial risk, SLA pressure, system impact, compliance sensitivity, and available workarounds. This MVP turns those inputs into a consistent operating view.

The value is not in replacing enterprise incident tooling. The value is in showing how an analyst can structure ambiguous incident information into measurable risk, workflow status, and stakeholder-ready communication.

## Technical Framing

The application is intentionally simple:
- Vite for fast local development
- React for UI composition
- TypeScript for domain types
- Custom CSS for a polished but lightweight interface
- Local rules instead of external services
- localStorage for MVP persistence

This keeps the demo easy to run and review while still showing meaningful product behavior.

## Interview Talking Points

- "I scoped this as an operational workflow MVP, not a full enterprise platform."
- "The risk model is transparent and explainable, using weighted business impact factors."
- "The reports and dashboard read from the same incident state, so status changes flow through the app."
- "I added defensive checks so malformed local data falls back safely."
- "Every action is expected to provide feedback, be disabled with a reason, or complete visibly."

## Current Limitations

- Data is browser-local only.
- There is no multi-user workflow.
- SLA status is rule-based, not time-window based.
- Classification is keyword-based and intentionally explainable.
- No automated tests are included yet.

## Possible Future Enhancements

These are intentionally outside the current MVP scope:
- Backend persistence
- Ticketing integration
- Audit history
- Role-based permissions
- Time-based SLA timers
- Exportable reports
- Automated test coverage
