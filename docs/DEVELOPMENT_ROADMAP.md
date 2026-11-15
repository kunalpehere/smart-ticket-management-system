# Development Roadmap

## Delivery approach

Build one end-to-end vertical slice at a time. Keep the app runnable after each implementation milestone, with migrations and sample data documented. Do not generate the full application in one pass.

Each phase below is a future implementation plan only; no scaffolding, application code, tests, or runtime has been created.

## Phases

| Phase | Goal and key work | Minimum verification / definition of done | Complexity |
|---|---|---|---|
| 0. Project baseline and decisions | Confirm project folder/name, create original Git repository, record SDK/tool versions, finalize role/status/SLA/report decisions, agree no copied source/assets. Prepare README skeleton and environment plan. | Clean initial commit; no borrowed source/assets; decisions recorded; prerequisites identified. | Low |
| 1. Backend/frontend foundations | Create solution/projects, Angular shell, configuration samples, DI, SQL Server EF context, health endpoint, responsive app shell, local development instructions. | API and Angular start locally; clean DB migration succeeds; no secrets committed; basic smoke checklist documented. | Medium |
| 2. Authentication and user approval | Registration, pending account, BCrypt login, JWT, exactly one role, Admin approval/role assignment, active state, login/approval UI. | Unit tests for hashing, pending/active/role rules; API tests for 401 and role gate; four demo roles usable locally. | Medium |
| 3. Ticket create/read/list | Categories/priorities, ticket creation, typed DTOs, role-filtered paginated lists, details, responsive tables/search/filter. | Tests for creator assignment, validation, EndUser ownership, Agent current assignment, Manager/Admin read scope; API request produces DB-backed result. | High |
| 4. Lifecycle and manager assignment | Implement allowed transitions, requester cancel/reopen/escalate, assigned-agent status changes, manager assign/reassign, assignment history, activity records. | Transition matrix unit tests; access-denial and valid-workflow API tests; only active/approved agents assigned; audit rows saved atomically. | High |
| 5. Comments and activity | Ordinary comments; ticket history for create/assignment/status/cancel/reopen/escalation/comment event. Add ticket detail timeline and comment UI. | Role/resource tests for read/write; Admin read but cannot comment; history actor/time present; no private-comment behavior. | Medium |
| 6. SLA and dashboards/reports | Priority duration config, due-date snapshot, overdue calculation, role-specific dashboards, Manager workload/overdue and Admin aggregate reports. | Unit tests for due date/overdue and terminal statuses; API reports computed from DB; no hardcoded metrics. | Medium |
| 7. Frontend workflow and polish | Complete forms, validation, confirmations, status/priority badges, paging, empty/loading/error states, accessible responsive layout, expired-session handling. | Angular tests for high-value forms/guards/error states; manual role-by-role usability checklist; keyboard/responsive review. | Medium |
| 8. Security and integration verification | Exercise complete role/resource matrix, SQL Server migration behavior, API status contract, DTO sanitization, configuration/secrets, logging, and docs. | Unit + API integration suites pass; manual checklist covers all roles; known limitations documented; no credentials in repo/logs. | High |
| Optional 9. Auto assignment | Consider least-loaded eligible agent only after manual assignment is stable; define atomic/concurrency behavior and deterministic tie-break. | Concurrency/provider-backed tests and clear demo value. Omit if it adds complexity without improving the project. | Medium/High |

### Phase details and rollback principles

- **Objective:** Each phase has one user-visible or foundation result.
- **Source areas:** Use the boundaries in ARCHITECTURE.md; avoid cross-layer shortcuts.
- **Dependencies:** Do not begin later workflows before their policies and API contracts are stable.
- **Tests:** Add unit tests for rules in the same phase; add API tests when authentication/routing is involved.
- **Acceptance:** The phase’s verification above passes and docs reflect actual behavior.
- **Risks:** Record contract, schema, and workflow changes before implementation.
- **Rollback:** Use a short-lived branch/commit per phase. Revert that phase independently; keep migrations and API contract changes isolated. Never “fix forward” unrelated refactors into a security change.

## Role-specific page and navigation plan

Use one shared authenticated shell with sidebar, top bar, responsive collapse, profile/session menu, and role-specific navigation. Backend authorization still applies to every API request.

### Public

- Login.
- Register.
- Pending approval confirmation.
- Friendly invalid-credential/account-inactive errors.

### EndUser

- Dashboard: total/open/resolved counts and recent tickets.
- My Tickets: searchable/filterable/paginated own tickets.
- New Ticket form: title, description, category, priority.
- Ticket Details: status/SLA, comments, history; Cancel/Reopen/Escalate actions only when allowed.
- Profile/logout.

### SupportAgent

- Dashboard: assigned/open/in-progress/resolved counts and workload.
- Assigned Queue: current assignments, status/priority filters, paging.
- Ticket Details: requester context, category/priority/SLA, comment thread/history, valid status actions.
- No assign/reassign controls.

### SupportManager

- Operations Dashboard: total/open/overdue/escalated tickets and agent workload.
- All Tickets: all statuses including cancelled/history; search/filter/sort/page.
- Ticket Details: full in-scope comments/history and assignment panel.
- Assignment dialog: eligible active/approved agents; confirmation for reassignment.
- Reports: status, priority/category distribution, overdue, workload.
- Configuration links are not shown.

### Admin

- Admin Dashboard: pending approvals, user counts, category/priority/SLA summary.
- User Approvals/User Management: approve/reject, assign exactly one role, activate/deactivate.
- Categories, Priorities, SLA Policies.
- Read-only Ticket Explorer: all tickets/statuses, sanitized details, comments/history.
- Read-only Reports.
- No ticket create/edit/status/assign/comment actions.

## Test strategy

### Unit tests

- Registration normalization, duplicate email, BCrypt verification, role invariant.
- Ticket creation validation and due-date snapshot.
- Ticket ownership/assignment/Manager/Admin read policy.
- Admin mutation denial.
- Valid/invalid transitions and actor role restrictions.
- Comment access and activity generation.
- Manual assignment eligibility and history.
- Escalation allowed statuses and idempotency.
- SLA due/overdue calculations.
- Pagination/filter validation and query policy.

### API integration tests

Use a test host and isolated DB configuration. Cover:
- Anonymous/authenticated behavior, JWT expiry/invalid token.
- Each controller’s role gates and 401/403.
- EndUser cross-user denial and Agent unassigned denial (404 concealment where chosen).
- Manager all-status access including Cancelled.
- Admin sanitized read-only access and denied ticket writes/comment creation.
- Assignment target eligibility.
- Comment/activity scope.
- 409 transition conflicts and DTO fields.

### Angular tests

Prioritize login/registration form validation, role navigation, ticket form, action visibility by status/role, API error/expired token handling, paging/filter controls, and empty/loading states. UI tests do not replace backend authorization tests.

No arbitrary coverage percentage is required. Add tests where a regression could expose data or corrupt workflow state.

## Documentation plan

Maintain:

- README.md: project purpose, supported tools, safe configuration, database setup/migrations, seed/demo users, local start instructions, test commands, troubleshooting, limitations.
- docs/PROJECT_OVERVIEW.md: scope and goals.
- docs/ARCHITECTURE.md: layer boundaries/dependencies.
- docs/DATABASE_DESIGN.md: entities, constraints, migrations.
- docs/AUTHORIZATION_MATRIX.md: roles and resource rules.
- docs/API_DESIGN.md: endpoint contracts and errors.
- docs/DEVELOPMENT_ROADMAP.md: phases, gates, known decisions.

Update docs when implementation changes; never claim unimplemented features are complete.

## Risks and assumptions

| Risk/decision | Mitigation or default |
|---|---|
| Role/resource checks duplicated between UI and API | Backend application policy is authoritative; Angular is UX only. |
| Admin read access accidentally permits writes | Separate read/write actions and test every mutation denial. |
| One-role policy conflicts with user expectations | Admin assigns exactly one; audit and test role changes. |
| Cancelled/history tickets omitted from Manager reporting | All-status operational scope; filters are presentation only. |
| Assignment to inactive/unapproved/non-agent user | Central eligibility validator used by every manual/automatic path. |
| Race in optional automatic assignment | Defer until needed; use provider-backed concurrency design and tests. |
| SLA ambiguity | Snapshot elapsed-hour due date; no business-hour pause/reset in MVP. |
| Hardcoded demo credentials/secrets | Development-only seed, local secrets/environment configuration, no production defaults. |
| SQL Server-specific behavior differs from in-memory tests | Integration tests against SQL Server for migrations, constraints, and important queries. |
| UI hides action but API permits it | API resource/action tests; never rely on hidden buttons. |
| Scope expands into enterprise infrastructure | Revisit only when a concrete user/demo need exists. |
| Reference project usage rights unresolved | This new implementation must be independently authored; do not copy source/assets. |

### Assumptions to confirm before workflow implementation

1. EndUser may cancel tickets in Created and Assigned, but not InProgress.
2. Reopening a Resolved ticket clears current assignment and returns it to Manager triage.
3. Manager may reassign before resolution; whether InProgress reassignment is allowed needs a final decision.
4. Escalation can be requested only in Created, Assigned, InProgress, Reopened; it does not change assignment/status.
5. SLA duration is elapsed hours from creation and does not pause. Reopened tickets retain original due date.
6. Admin reports expose only aggregate/system data and sanitized ticket details.
7. User role changes after approval are allowed only through an audited Admin action.
8. Initial system has no team/tenant boundary.

## Why this scope fits a fresher portfolio

The MVP demonstrates core engineering skills that can be explained with concrete examples: relational modeling, REST design, validation, authentication, resource authorization, state machines, transactions/audit history, SQL queries, Angular forms and data tables, and automated tests.

It is challenging enough to discuss real trade-offs—such as resource access, assignment eligibility, and SLA semantics—without introducing distributed operations that are hard to build or defend in an entry-level interview. Optional features are explicitly deferred so correctness, usability, and understanding remain the priorities.
