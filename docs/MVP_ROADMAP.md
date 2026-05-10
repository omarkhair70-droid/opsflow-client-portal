# OpsFlow MVP Roadmap

## Real sequence
1. **Phase 0A — Documentation Foundation — complete**
   - Product scope, architecture direction, and guardrails documented.
2. **Phase 1 — Foundation Implementation — complete**
   - Auth/session, membership model, base schema, RLS baseline, and org-scoped shells implemented.
3. **Phase 1.5 — Source of Truth Cleanup — complete**
   - Documentation reconciled to implemented reality and prepared for Phase 2 execution.
4. **Phase 2 — Request Lifecycle — complete**
   - Implemented `requests` flow: intake, triage states, role-safe visibility, baseline activity events.
5. **Phase 3 — Internal Execution — implemented**
   - Implemented `tasks` assignment, due dates, status updates, and task activity events.
6. **Phase 4 — Commercial Flow — next**
   - Implement `quotes` and `approvals` with clear client/internal boundaries and lifecycle transitions.
7. **Phase 5 — File Governance**
   - Implement `file_assets` with visibility controls, secure linking, and policy enforcement.
8. **Phase 6 — Notifications + Demo Polish**
   - Implement `notifications`, tighten demo coherence, and ensure lifecycle usability end-to-end.
9. **Phase 7 — Security QA + Flagship Polish**
   - Harden RLS/role matrix testing, audit integrity checks, and flagship readiness polish.

## MVP Exit Criteria
MVP is complete when OpsFlow demonstrates this real end-to-end flow with tenant-safe controls:

**client request → internal triage → tasks (implemented) / files (planned) → quote → approval → activity history → closure**
