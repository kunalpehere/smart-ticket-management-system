# Project Overview

## Purpose

Smart Ticket Management System is an independently authored, fresher-level portfolio application for handling internal support requests. It demonstrates a complete workflow across Angular, an ASP.NET Core API, and SQL Server: account approval, ticket creation, controlled assignment, status changes, comments, audit history, and basic SLA/reporting.

This project is a fresh implementation. It is not an extension of another repository. Use general engineering lessons only; do not copy another project’s source, distinctive UI, assets, naming details, or implementation.

## Goals

- Work end to end locally with a clear, understandable architecture.
- Enforce authentication, role permissions, and ticket-specific access on the backend.
- Keep lifecycle and assignment rules explicit and testable.
- Provide a professional responsive interface that supports real workflows.
- Use migrations, validation, consistent errors, and focused automated tests.
- Be simple enough to explain and demonstrate confidently in interviews.

## Recommended stack

| Area | Recommendation |
|---|---|
| Backend | C#, ASP.NET Core Web API on .NET 10 LTS, Entity Framework Core, REST, JWT bearer authentication, BCrypt password hashing. |
| Frontend | Angular 21 with TypeScript 5.9 and RxJS 7; Angular Material for accessible controls and layout primitives. |
| Runtime tooling | Node.js 22.12 or newer compatible 22.x release for Angular 21; verify Angular’s compatibility table when pinning exact versions. |
| Database | SQL Server with EF Core migrations; use a local developer instance or SQL Server Developer/Express edition. |
| Tests | xUnit unit tests; ASP.NET Core WebApplicationFactory integration tests where useful; Angular unit/component tests for critical behavior. |
| Tools | VS Code, Git/GitHub, Postman, and a SQL client such as SSMS/Azure Data Studio. |

**Compatibility note (checked 2026-11-15):** .NET 8 support ended on 2026-11-10; .NET 10 is the active LTS release in the official support table. Angular’s official compatibility table lists Angular 21 with Node 20.19+/22.12+/24+, TypeScript 5.9, and RxJS 7.4+. Pin compatible versions at project setup rather than relying on floating latest versions. Sources: [Microsoft .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core), [Angular version compatibility](https://angular.dev/reference/versions).

No extra runtime technology is required for the MVP. Avoid adding MediatR, a generic repository framework, Redis, queues, SignalR, or cloud services unless a demonstrated need emerges.

## Scope

### Essential MVP

1. Registration creates a pending, inactive-for-login account state; role is not selected by the public request.
2. Admin approves an account and assigns exactly one role.
3. Login verifies a BCrypt hash and returns a short-lived JWT with user ID and one recognized role.
4. EndUser creates and lists only their tickets.
5. SupportManager views all tickets, including cancelled/history, and assigns/reassigns eligible agents.
6. SupportAgent sees and acts only on currently assigned tickets.
7. Ticket status transitions are explicitly validated.
8. Authorized users can add/read ordinary comments; no private/internal comment feature.
9. Important actions create activity history.
10. EndUser can cancel, reopen, or escalate only eligible tickets they created.
11. Priority-based SLA duration is snapshotted into a due date at creation and displayed as remaining/overdue.
12. Role dashboards and a small set of database-backed reports.
13. Validation, consistent API errors, pagination on operational lists, and focused unit/integration/UI tests.

### Optional after the MVP

- Least-loaded automatic assignment, only after manual assignment is correct and regression-tested.
- Email notifications for approval or ticket updates, only if a real demo need exists.
- Real-time updates, only if polling/manual refresh proves inadequate.
- CSV export and additional report filters.
- Password reset through email.

### Deliberately excluded

Microservices, Kubernetes, multi-tenancy, SSO, complex approval chains, event buses/queues, distributed caching, elaborate deployment environments, internal comments, and a complex SLA scheduler. These add operational or policy cost without improving the core fresher-level demonstration.

## Roles and value

| Role | Primary workflow |
|---|---|
| EndUser | Submit a request, follow its progress, communicate, cancel/reopen/escalate when permitted. |
| SupportAgent | Work assigned tickets, update valid statuses, communicate, and review history. |
| SupportManager | Triage all tickets, assign agents, monitor overdue work, review reports. |
| Admin | Approve users, assign one role, maintain categories/priorities/SLAs, inspect ticket data read-only. |

Backend resource rules are authoritative. Angular guards and hidden buttons improve navigation but never grant access.

## Success criteria

- A new user cannot authenticate before approval.
- A role cannot access another role’s ticket data beyond policy.
- Every mutation is authorized and state-validated before saving.
- Assignment targets are active, approved SupportAgents.
- Ticket and related comment/activity access use the same resource boundary.
- Admin reads sanitized data and cannot mutate tickets or add comments.
- A local developer can migrate a clean database, start API/UI, and demonstrate all four roles using documented non-production seed accounts.
- Tests cover important allow/deny cases and lifecycle rules.
- Documentation accurately matches the implemented behavior.

## Assumptions and open decisions

- Initial deployment is a single system with no tenant/team boundary.
- Exactly one application role is active for each account.
- Admin approval assigns one role; account role changes require an audited admin action.
- No email/password-reset feature is required for the first demo.
- Priority SLA durations and exact lifecycle state rules are finalized in the database design.
- Repository ownership/rights for any prior reference material remain separate; this new implementation should be original.
