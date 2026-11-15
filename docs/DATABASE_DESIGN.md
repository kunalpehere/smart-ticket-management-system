# Database Design

## Design goals

Use a small relational schema with explicit ownership, current assignment, audit history, and referential integrity. Store UTC timestamps with DateTimeOffset semantics. Use EF Core migrations. Do not hard-delete tickets; operational and audit history should remain coherent.

## Entities

| Entity | Purpose and essential fields | Keys and relationships | Constraints/indexes | MVP |
|---|---|---|---|---|
| User | Account identity and state: Id, FullName, Email, NormalizedEmail, PasswordHash, Role (one enum), IsActive, IsApproved, CreatedAt, UpdatedAt | PK Id. One-to-many as ticket creator, current assignee, comments, activities, and assignment actor/target. | Unique NormalizedEmail; index Role/IsApproved for admin queue; never expose PasswordHash. | Essential |
| TicketCategory | Admin-managed classification: Id, Name, Description, IsActive, CreatedAt, UpdatedAt | PK Id; one-to-many Tickets. | Unique normalized Name; restrict delete while tickets reference it (deactivate instead). | Essential |
| TicketPriority | Ordered severity: Id, Name, Level, IsActive, CreatedAt, UpdatedAt | PK Id; one-to-many Tickets; one-to-one SLA policy. | Unique Name and Level; restrict deletion while referenced. | Essential |
| SlaPolicy | Priority-based resolution duration: Id, PriorityId, ResolutionHours, IsActive, CreatedAt, UpdatedAt | PK Id; unique FK PriorityId; one policy per priority. | ResolutionHours > 0; unique PriorityId. Deactivate/edit rather than destructive delete. | Essential |
| Ticket | Request/work item: Id, Title, Description, CreatorUserId, AssignedAgentUserId nullable, CategoryId, PriorityId, Status, IsEscalated, EscalatedAt nullable, SlaDueAt, CreatedAt, UpdatedAt, ResolvedAt nullable, CancelledAt nullable, ReopenedAt nullable | PK Id. Required FKs to creator/category/priority; optional current agent FK. One-to-many comments, activities, assignment history. | Index (CreatorUserId, CreatedAt), (AssignedAgentUserId, Status), (Status, SlaDueAt); FKs restrict user/category/priority delete. Due date is a creation-time snapshot. | Essential |
| TicketComment | Ordinary user-visible communication: Id, TicketId, AuthorUserId, Body, CreatedAt | PK Id; FK to Ticket/User. | Index (TicketId, CreatedAt); restrict author deletion or anonymize user under an explicit retention rule. No private/internal flag in MVP. | Essential |
| TicketActivity | Audit trail: Id, TicketId, ActorUserId, ActivityType, FieldName nullable, OldValue nullable, NewValue nullable, CreatedAt | PK Id; FK to Ticket/User. | Index (TicketId, CreatedAt); actor and time required. Do not store passwords/tokens or full comment body. | Essential |
| TicketAssignment | Assignment history: Id, TicketId, AgentUserId, AssignedByUserId, AssignedAt | PK Id; FK to Ticket; two User FKs for target and manager actor. Current assignee also lives on Ticket for simple queries. | Index (TicketId, AssignedAt), (AgentUserId, AssignedAt). Do not hard-delete history. | Essential |

### Role storage decision

Use a single Role enum/string column on User for the initial one-effective-role policy. Do not add Role and UserRole join tables unless the product later needs simultaneous roles. Role changes are performed by Admin through an explicit, audited workflow. Validate recognized values in application code; optionally add a SQL check constraint if the chosen EF/provider setup supports it cleanly.

### Status storage and relationships

Ticket.Status is an enum with Created, Assigned, InProgress, Resolved, Reopened, Cancelled. Persist as a string conversion or a constrained integer; string is easier to inspect in SQL but should be configured consistently. No Closed status is included in the initial scope. Resolved is terminal except creator reopening; Cancelled is terminal.

The current assignee is nullable until assignment. TicketAssignment rows preserve previous and current assignments. Reassignment updates Ticket.AssignedAgentUserId and appends a history row in the same transaction.

### SLA semantics

At ticket creation, choose the active SlaPolicy associated with selected priority and snapshot SlaDueAt = CreatedAt + ResolutionHours. Later policy edits affect new tickets only. An active ticket is overdue when current UTC time exceeds SlaDueAt; Resolved and Cancelled tickets are not shown as currently overdue. Reopened tickets use the original deadline in MVP; if product wants a reset/paused clock, that is a separate policy change.

This is elapsed-time SLA, not business-hours scheduling. No background job is needed just to display overdue status; calculate it in manager queries. A scheduled process can be added later only if persistent breach notifications/audits are required.

### Referential integrity and deletion

- User, category, priority, and SLA references are protected by foreign keys.
- Deactivate categories/priorities/SLA policies instead of deleting referenced rows.
- Ticket deletion is not a normal user operation. Preserve comments, activity, and assignments.
- If account deletion is later required, define anonymization/retention and audit rules first.
- Save ticket changes and corresponding activity/assignment records atomically.

## ER diagram

~~~mermaid
erDiagram
    USER {
        int Id PK
        string FullName
        string NormalizedEmail UK
        string PasswordHash
        string Role
        bool IsActive
        bool IsApproved
        datetimeoffset CreatedAt
        datetimeoffset UpdatedAt
    }
    TICKET_CATEGORY {
        int Id PK
        string Name UK
        string Description
        bool IsActive
    }
    TICKET_PRIORITY {
        int Id PK
        string Name UK
        int Level UK
        bool IsActive
    }
    SLA_POLICY {
        int Id PK
        int PriorityId FK,UK
        int ResolutionHours
        bool IsActive
    }
    TICKET {
        int Id PK
        string Title
        string Description
        int CreatorUserId FK
        int AssignedAgentUserId FK
        int CategoryId FK
        int PriorityId FK
        string Status
        datetimeoffset SlaDueAt
        bool IsEscalated
        datetimeoffset CreatedAt
        datetimeoffset UpdatedAt
    }
    TICKET_COMMENT {
        int Id PK
        int TicketId FK
        int AuthorUserId FK
        string Body
        datetimeoffset CreatedAt
    }
    TICKET_ACTIVITY {
        int Id PK
        int TicketId FK
        int ActorUserId FK
        string ActivityType
        string FieldName
        string OldValue
        string NewValue
        datetimeoffset CreatedAt
    }
    TICKET_ASSIGNMENT {
        int Id PK
        int TicketId FK
        int AgentUserId FK
        int AssignedByUserId FK
        datetimeoffset AssignedAt
    }

    USER ||--o{ TICKET : creates
    USER o|--o{ TICKET : currently_assigned
    TICKET_CATEGORY ||--o{ TICKET : classifies
    TICKET_PRIORITY ||--o{ TICKET : prioritizes
    TICKET_PRIORITY ||--|| SLA_POLICY : defines
    TICKET ||--o{ TICKET_COMMENT : has
    USER ||--o{ TICKET_COMMENT : writes
    TICKET ||--o{ TICKET_ACTIVITY : records
    USER ||--o{ TICKET_ACTIVITY : performs
    TICKET ||--o{ TICKET_ASSIGNMENT : assignment_history
    USER ||--o{ TICKET_ASSIGNMENT : receives
    USER ||--o{ TICKET_ASSIGNMENT : assigns
~~~

## Important constraints to implement

- Normalize email consistently before checking uniqueness; enforce a unique index in SQL Server.
- Required non-empty title/body fields and sensible max lengths in DTO validation and database schema.
- Priority Level and SLA ResolutionHours must be positive.
- Ticket creator/category/priority are required; assigned agent may be null.
- Only active categories/priorities/policies are selectable for new tickets.
- Only active, approved SupportAgent users can become assigned agent.
- Application workflow validates status transitions; a DB constraint can guard invalid enum values but is not a substitute for workflow rules.
- Activity actor and timestamp are non-null; include activity in the same transaction as the operation.
- Every listing query should have an index that supports its ownership/scope filter and sort.

## Intentionally omitted entities/features

- Separate Role/UserRole tables: unnecessary for one effective role.
- Internal/private comments: no requirement; avoid visibility complexity.
- Notification/outbox tables, attachments, SLA pause intervals, tenant tables, and escalation queues: defer until a demonstrated requirement exists.
- Dedicated TicketStatusHistory table: TicketActivity stores lifecycle old/new values; add a specialized table only if reporting/query requirements justify it.
- Agent skill/availability entities: not required for manager-selected assignment.
