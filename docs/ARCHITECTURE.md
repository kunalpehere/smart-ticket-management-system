# Architecture

## Decision

Use a **lightweight layered modular monolith** with a small number of projects. Deploy one API and one Angular application backed by one SQL Server database.

- **API:** HTTP concerns, authentication middleware, controllers/endpoints, request binding, coarse role gates, and response mapping.
- **Application:** use cases, DTOs, interfaces for infrastructure needs, validation orchestration, and resource authorization.
- **Domain:** core entities, role/status enums, and ticket transition rules. No ASP.NET, EF Core, or HTTP dependencies.
- **Infrastructure:** EF Core DbContext/migrations, SQL Server configuration, persistence queries, and development seeding.

This is a lightweight Clean Architecture arrangement: compile-time dependency direction protects business rules, while a single API process keeps operation simple. It adds some setup compared with one project and folders, but makes boundaries and tests easier to explain. Do not add CQRS, MediatR, a generic repository framework, an event bus, or separate microservices. Application services can use focused query interfaces or EF-backed services; add abstractions only for a clear boundary.

## Dependency direction

~~~mermaid
flowchart LR
    Api[API] --> App[Application]
    Api --> Infra[Infrastructure composition]
    Infra --> App
    Infra --> Domain[Domain]
    App --> Domain
~~~

API is the composition root and references Infrastructure to register it. Application must not reference API or Infrastructure. Domain must not reference other layers. Keep interfaces needed by application use cases in Application and implement them in Infrastructure.

## Suggested repository layout

    SmartTicketManagementSystem/
    ├── Backend/
    │   ├── SmartTicket.Api/
    │   │   ├── Controllers/
    │   │   ├── Middleware/
    │   │   ├── Contracts/             # HTTP-only details if needed
    │   │   ├── Extensions/
    │   │   └── Program.cs
    │   ├── SmartTicket.Application/
    │   │   ├── Abstractions/
    │   │   │   ├── Persistence/
    │   │   │   └── Security/
    │   │   ├── Authorization/
    │   │   ├── DTOs/
    │   │   ├── Features/
    │   │   │   ├── Authentication/
    │   │   │   ├── Tickets/
    │   │   │   ├── Comments/
    │   │   │   ├── Assignments/
    │   │   │   ├── Reports/
    │   │   │   └── Administration/
    │   │   ├── Services/
    │   │   └── Validation/
    │   ├── SmartTicket.Domain/
    │   │   ├── Entities/
    │   │   ├── Enums/
    │   │   └── Rules/
    │   ├── SmartTicket.Infrastructure/
    │   │   ├── Data/
    │   │   │   ├── Configurations/
    │   │   │   ├── Migrations/
    │   │   │   └── DevelopmentSeed/
    │   │   ├── Persistence/
    │   │   └── Security/
    │   └── SmartTicket.sln
    ├── Frontend/
    │   └── src/app/
    │       ├── core/
    │       │   ├── auth/
    │       │   ├── guards/
    │       │   ├── interceptors/
    │       │   └── services/
    │       ├── layout/
    │       ├── shared/
    │       │   ├── components/
    │       │   ├── models/
    │       │   └── ui/
    │       └── features/
    │           ├── auth/
    │           ├── end-user/
    │           ├── agent/
    │           ├── manager/
    │           ├── admin/
    │           └── reports/
    ├── tests/
    │   ├── SmartTicket.UnitTests/
    │   └── SmartTicket.Api.IntegrationTests/
    ├── docs/
    └── README.md

This is a proposal, not generated scaffolding. Keep feature folders small and add files only for clear responsibilities.

## Backend responsibilities

### API layer

Controllers bind/validate requests, derive identity and role from validated claims, call an application use case, and map results to HTTP. Never accept owner ID or actor role from the request body. Use consistent ProblemDetails-style errors. Do not return EF entities.

Use role attributes for coarse endpoint gates. Application services must also enforce ticket-resource authorization before returning or changing a ticket.

### Application layer

Organize by use case rather than one oversized service: Authentication, Tickets, Comments, Assignment, Reports, Administration. A proposed reusable ticket authorization component evaluates actor ID, the single effective role, ticket, and action. It should return a clear allow/deny or typed application error and must not depend on ASP.NET HttpContext.

### Domain layer

Keep role/status values and ticket transition rules explicit and independently testable. Domain rules decide valid transitions; application authorization decides whether this actor may attempt them. A valid transition does not imply permission.

### Infrastructure layer

Use EF Core and focused entity configurations. Keep SQL-specific data access in infrastructure/application data services as appropriate. Run migrations deliberately during development; avoid silently migrating shared production databases on every application start.

## Authentication and authorization flow

~~~mermaid
sequenceDiagram
    participant U as User
    participant UI as Angular
    participant API as ASP.NET API
    participant APP as Application service
    participant DB as SQL Server
    U->>UI: Submit credentials
    UI->>API: POST login
    API->>APP: Validate account and password
    APP->>DB: Load user and one role
    DB-->>APP: User record
    APP-->>UI: Short-lived signed JWT
    UI->>API: Request with bearer token
    API->>API: Validate token and coarse role
    API->>APP: Call use case with trusted identity
    APP->>DB: Load ticket and apply resource policy
    DB-->>APP: Authorized data/result
    APP-->>UI: DTO or typed error
~~~

JWT should contain subject/user ID, issuer, audience, expiry, and exactly one recognized role claim. Signing key comes from user-secrets/environment and is never committed. BCrypt hashes passwords. Check approval/active status at login. The API validates token expiry; Angular handles 401 and clears stale session state. Logout clears client storage; no server-side revocation is promised.

## Angular responsibilities

- **core/auth:** session/token handling and role UX helpers.
- **core/guards:** navigation restrictions only.
- **core/interceptors:** attach bearer token and centralize 401 handling.
- **core/services:** typed HTTP clients.
- **shared:** reusable status badges, confirmation dialog, empty/loading/error states, form controls.
- **features:** route-level pages and role workflows.
- **layout:** responsive shell, sidebar, header, session menu.

Keep backend DTOs and frontend models aligned but do not share generated source across runtime boundaries in the MVP. Use typed forms/API results; avoid untyped any.

## Validation, errors, logging

Validate required fields, lengths, email format, allowed values, and page bounds at the API boundary; enforce business invariants in application/domain rules.

- 401: unauthenticated/invalid token.
- 403: role/action denied when resource existence is known.
- 404: missing or intentionally concealed ticket.
- 409: valid request conflicts with workflow state.
- 400: malformed/invalid request.

Log operational identifiers and failures, not passwords, JWTs, signing keys, or full comment bodies. Avoid revealing inaccessible ticket information.

## Testing boundaries

- Domain/application unit tests run without SQL Server for transitions, authorization, validators, SLA math, and use-case outcomes.
- Infrastructure integration tests use a test SQL Server when provider behavior/migrations matter.
- API integration tests use ASP.NET Core WebApplicationFactory and isolated configuration/database to verify JWT, routes, statuses, and DTO exposure.
- Angular tests cover forms, guards as UX, API error handling, and high-value components.

Microsoft documents WebApplicationFactory and test web hosts for [ASP.NET Core integration testing](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests).

## Trade-offs

- A modular monolith is straightforward to build, run, and demo without distributed-system overhead.
- Separate projects make dependency rules visible, at the cost of additional setup.
- Feature folders avoid one catch-all service while staying familiar.
- No repository abstraction is added by default; EF Core already provides query and unit-of-work capabilities.
- Local SQL Server is representative of the target database; an in-memory provider alone is not sufficient for SQL behavior/migrations.
