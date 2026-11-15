# API Design

## Conventions

- Base path: /api.
- JSON request/response bodies use camelCase.
- All routes require a valid bearer token except register/login.
- Derive user ID and role from validated JWT claims; never accept them as authorization inputs.
- Use DTOs, not EF entities.
- Lists use server-side pagination with page (1-based), pageSize (default 20, maximum 100), optional validated filters, totalCount, and stable sort.
- Apply role/resource predicates before filters/count/page.
- Use consistent ProblemDetails responses: 400 invalid request, 401 unauthenticated, 403 role/action denial, 404 missing or concealed ticket, 409 lifecycle conflict.
- No generic ticket PUT/DELETE endpoint. Use narrow commands that map to defined business actions.

These are proposed endpoint contracts for a new implementation, not claims about existing routes.

## Authentication

| Method and path | Access | Purpose |
|---|---|---|
| POST /api/auth/register | Anonymous | Create pending account; no role can be chosen in body. |
| POST /api/auth/login | Anonymous | Verify password and account approval/active status; issue short-lived JWT with one role. |

Logout is client-side token removal in the MVP. No refresh/revocation endpoint or email password reset is planned.

## User and role administration

| Method and path | Access | Purpose |
|---|---|---|
| GET /api/admin/users/pending | Admin | Page pending approvals. |
| GET /api/admin/users | Admin | Search/page users with safe DTO fields. |
| POST /api/admin/users/{userId}/approve | Admin | Approve account and assign exactly one role. |
| POST /api/admin/users/{userId}/reject | Admin | Reject/deactivate a pending account. |
| PATCH /api/admin/users/{userId}/role | Admin | Optional audited role change for an approved account; include only if role changes are needed after approval. |
| PATCH /api/admin/users/{userId}/active | Admin | Activate/deactivate account with audit record. |

The last three role/active routes are recommendations for explicit administrative workflows; they are not existing endpoints. Never return PasswordHash or token data.

## Tickets

| Method and path | Access | Purpose |
|---|---|---|
| GET /api/tickets | EndUser, SupportAgent, SupportManager, Admin | Role-filtered paginated list: own-created, currently assigned, all operational, or all read-only respectively. |
| POST /api/tickets | EndUser | Create ticket; owner derived from identity; category/priority must be active. |
| GET /api/tickets/{ticketId} | EndUser, SupportAgent, SupportManager, Admin | Read if owner/current assignee/in scope/Admin; return sanitized detail DTO. |
| POST /api/tickets/{ticketId}/cancel | EndUser | Cancel own eligible ticket. |
| POST /api/tickets/{ticketId}/reopen | EndUser | Reopen own eligible resolved ticket. |
| PATCH /api/tickets/{ticketId}/status | Assigned SupportAgent | Apply a requested valid next status; actor must be current assignee. |
| POST /api/tickets/{ticketId}/escalation | EndUser | Escalate own eligible active ticket; idempotent. |

No broad update route is exposed. Each action checks ticket scope before state rules and persistence.

### List query

GET /api/tickets accepts page, pageSize, status, categoryId, priorityId, sortBy, sortDirection. Allow only documented sort fields; use TicketId as a deterministic tie-breaker. Role filter is mandatory and cannot be overridden by query parameters.

## Assignment

| Method and path | Access | Purpose |
|---|---|---|
| PUT /api/tickets/{ticketId}/assignment | SupportManager | Assign or reassign to an active, approved SupportAgent; validate operational scope and assignable state. |
| GET /api/manager/agents | SupportManager | List eligible active/approved agents for assignment UI. |

These are proposed routes. One application use case handles manual assignment and writes assignment history. Optional automatic assignment should call the same eligibility rule.

## Comments and activity

| Method and path | Access | Purpose |
|---|---|---|
| GET /api/tickets/{ticketId}/comments | EndUser, SupportAgent, SupportManager, Admin | Read comments only if the associated ticket is accessible; Admin is read-only. |
| POST /api/tickets/{ticketId}/comments | EndUser, SupportAgent, SupportManager | Add ordinary comment if role/resource rule permits. |
| GET /api/tickets/{ticketId}/activities | EndUser, SupportAgent, SupportManager, Admin | Read history with the same ticket scope; Admin is read-only. |

Comments are public to users authorized for the ticket. No internal-comment field is in MVP. Activity records action/actor/time and selected field changes, not full comment contents or secrets.

## Categories, priorities, and SLA

| Method and path | Access | Purpose |
|---|---|---|
| GET /api/categories | All authenticated roles | Active categories for form/list display. |
| POST /api/admin/categories | Admin | Create category. |
| PATCH /api/admin/categories/{categoryId}/active | Admin | Activate/deactivate category. |
| GET /api/priorities | All authenticated roles | Active priorities. |
| POST /api/admin/priorities | Admin | Create priority. |
| PATCH /api/admin/priorities/{priorityId}/active | Admin | Activate/deactivate priority. |
| GET /api/admin/sla-policies | Admin | Read SLA configuration. |
| PUT /api/admin/sla-policies/{priorityId} | Admin | Create/update duration for one priority. |

Use deactivation rather than deleting values referenced by existing tickets. New ticket due date snapshots the active policy at creation.

## Dashboards and reports

| Method and path | Access | Purpose |
|---|---|---|
| GET /api/dashboard | EndUser, SupportAgent, SupportManager, Admin | Return role-specific dashboard counts from real database data; never trust a requested user ID. |
| GET /api/reports/manager/summary | SupportManager | Operational ticket counts, overdue counts, and eligible-agent workload. |
| GET /api/reports/admin/summary | Admin | Sanitized read-only system-level counts and approval totals. |

Dashboard/report projections must reuse the same scope as lists. Admin reports contain no credentials/secrets. Avoid exposing report details that exceed each role’s ticket visibility.

## Endpoint authorization sequence

1. Authenticate the bearer token.
2. Enforce coarse route role.
3. Derive actor ID/effective role from claims.
4. Load only required ticket/resource data.
5. Apply ownership, current-assignment, operational-scope, or Admin read-only policy.
6. Return 404 for missing or deliberately concealed out-of-scope ticket; 403 for known resource/action denial.
7. For authorized mutation, validate lifecycle/assignment state.
8. Persist business state and activity/assignment history atomically.
9. Return DTO or consistent error response.

## Versioning and compatibility

No version prefix is required for the first portfolio release. Keep request/response DTOs documented and tested. If a later breaking change is needed, introduce a deliberate versioning strategy rather than silently changing list shapes or status codes.

## Open API decisions

- Exact ticket/report fields visible to Admin.
- Whether post-approval role change is included in MVP.
- Exact cancellation eligibility for Assigned tickets.
- Whether Manager may reassign during InProgress.
- Whether a dedicated admin list route or role-aware GET /api/tickets is preferable.
