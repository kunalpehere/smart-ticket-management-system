# Authorization Matrix

## Policy decisions

- A user has exactly one effective application role: EndUser, SupportAgent, SupportManager, or Admin.
- Identity and role come from a validated JWT, never request-body fields or Angular localStorage.
- Controllers enforce coarse role gates; application services enforce ticket/resource access before returning data or changing state.
- EndUser access is limited to tickets they created.
- SupportAgent access is limited to tickets currently assigned to them. Historical assignment alone does not grant current access.
- SupportManager can read all tickets in the initial single-system application, across all statuses including Cancelled.
- Admin can read all approved ticket information but cannot mutate tickets or add ticket comments.
- Ticket comments and activity history use the same ticket resource boundaries as ticket details.
- Angular guards/buttons are usability controls, not security controls.

## Matrix

“Conditional” means all listed ownership, assignment, scope, and state conditions must pass.

| Operation | EndUser | SupportAgent | SupportManager | Admin |
|---|---|---|---|---|
| Register/login | Allowed, subject to account approval/active state for login | Same | Same | Same |
| Create ticket | Allowed; creator ID derived from identity; active category/priority required | Denied | Denied | Denied |
| List tickets | Conditional: CreatorUserId is caller; any status | Conditional: current AssignedAgentUserId is caller; any status | Conditional: system operational scope; all statuses | Conditional: all tickets/statuses, read-only, sanitized |
| View details | Conditional: own ticket | Conditional: currently assigned | Conditional: any ticket in system scope | Conditional: any ticket, read-only, sanitized |
| Cancel | Conditional: own ticket; Created or Assigned | Denied | Denied | Denied |
| Reopen | Conditional: own Resolved ticket | Denied | Denied | Denied |
| Change status | Denied | Conditional: currently assigned; Assigned→InProgress or InProgress→Resolved | Denied | Denied |
| Assign/reassign | Denied | Denied | Conditional: system scope; target active, approved SupportAgent; ticket state assignable | Denied |
| Add comment | Conditional: own ticket | Conditional: currently assigned | Conditional: any in-scope ticket | Denied |
| View comments | Conditional: own ticket | Conditional: currently assigned | Conditional: any in-scope ticket | Conditional: all tickets, read-only |
| View activity | Conditional: own ticket | Conditional: currently assigned | Conditional: any in-scope ticket | Conditional: all tickets, read-only |
| Escalate | Conditional: own ticket in Created, Assigned, InProgress, or Reopened; idempotent | Denied | Denied | Denied |
| View reports | Denied | Denied | Conditional: operational reports/system scope | Conditional: approved read-only reports, sanitized |
| Approve users | Denied | Denied | Denied | Allowed |
| Assign/change user role | Denied | Denied | Denied | Conditional: one effective role; audit role changes |
| Manage categories | Denied | Denied | Denied | Allowed |
| Manage priorities | Denied | Denied | Denied | Allowed |
| Manage SLA policies | Denied | Denied | Denied | Allowed |

Admin is deliberately denied every ticket mutation, including status change, assignment, reassignment, cancellation, reopening, escalation, and comment creation. “Read-only” includes no mutation through alternate endpoints or dashboard actions.

## Ticket lifecycle

The MVP uses six statuses; it does not include Closed.

| From | To | EndUser | SupportAgent | SupportManager | Notes |
|---|---|---|---|---|---|
| Created | Assigned | No | No | Yes, when assigning eligible agent | Assignment operation changes status. |
| Created | Cancelled | Yes, own ticket | No | No | Creator may cancel before work begins. |
| Assigned | InProgress | No | Yes, if current assignee | No | Agent begins work. |
| Assigned | Cancelled | Yes, own ticket | No | No | Requester may cancel while assigned; confirm business rule. |
| InProgress | Resolved | No | Yes, if current assignee | No | Agent reports resolution. |
| InProgress | Cancelled | Denied | Denied | Denied | Do not cancel while actively being worked; requester may ask via comment. |
| Resolved | Reopened | Yes, own ticket | No | No | Creator says issue is not resolved; clear current assignment. |
| Reopened | Assigned | No | No | Yes, when assigning eligible agent | Manager re-triages and assignment is recorded. |
| Cancelled | Any | Denied | Denied | Denied | Terminal for MVP. |
| Resolved | Any except Reopened | Denied | Denied | Denied | Terminal except creator reopen. |

Direct assignment and lifecycle transition checks remain separate. In particular, manager visibility of a ticket never means the manager may bypass state rules.

**Business confirmation needed:** Whether an EndUser can cancel Assigned tickets; this matrix recommends yes. Whether reopening should clear current assignment is recommended yes so the ticket returns to manager triage. Escalation does not change assignment or status.

## Resource authorization and response behavior

Check authorization before returning protected fields or performing a mutation.

- 401 for missing or invalid authentication.
- 403 for authenticated callers denied an operation they may know about, such as Admin attempting ticket mutation.
- 404 for missing resources; also use 404 for out-of-scope ticket IDs when existence should be concealed, especially EndUser/Agent cross-ticket requests.
- 409 for an otherwise permitted operation that conflicts with current ticket state.
- 400 for malformed/invalid input.

Use the same resource-denial convention for details, comments, activity, and mutations. Manager/Admin have system-wide visibility, so a known ticket with denied write is 403, while an unknown ID is 404.

## API implementation notes

- Derive CreatorUserId, actor IDs, and role from the authenticated principal.
- Do not accept ownership/assignment policy decisions from submitted data.
- Query ticket lists with role/resource filters before count and pagination.
- For Admin, return explicit DTOs that exclude password hashes, tokens, secrets, and unrelated user details.
- Do not expose generic update or delete endpoints.
- When logging activity, record actor, action, relevant old/new values, and UTC timestamp; never store credentials or full comment bodies in activity.
- Validate assignment target is an existing, active, approved SupportAgent in the same service used for manual assignment.
- No internal/private comments are included in the MVP. If introduced later, add explicit visibility rules and tests before release.
