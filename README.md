# Smart Ticket Management System

An independently authored portfolio project for an internal support-ticket workflow. It uses an Angular frontend, an ASP.NET Core API, and SQL Server.

**Status:** Phase 1 foundations are implemented and verified. Authentication, ticket workflows, and database schema are planned for later phases.

## Implemented in Phase 1

- .NET 10 solution with API, Application, Domain, and Infrastructure projects.
- EF Core 10 SQL Server provider, an empty ApplicationDbContext, and infrastructure dependency registration.
- A local Windows-authenticated connection string stored in User Secrets, outside source control.
- Development Swagger UI, ProblemDetails exception handling, explicit local CORS origins, and GET /api/health.
- Angular 21 standalone application with strict TypeScript, routing, Angular Material, and a responsive welcome shell.
- Environment-based frontend API URL and Angular HttpClient.
- One backend API health integration test and one Angular root-shell test.

## Planned for later phases

Authentication and account approval, role/authorization behavior, ticket creation and assignment, comments/activity, SLA/reporting, business dashboards, and database entities/migrations are not implemented.

## Architecture

The backend is a lightweight layered modular monolith:

- **API:** HTTP startup, Swagger, middleware, CORS, and health endpoint.
- **Application:** application/use-case layer; currently has no business behavior.
- **Domain:** domain rules and entities will be introduced with later workflows.
- **Infrastructure:** EF Core provider, empty context, and dependency registration.

References follow the documented direction: API → Application and Infrastructure; Infrastructure → Application and Domain; Application → Domain.

The frontend uses a standalone root, routed AppShell, a features/home page, and Angular environment files. Frontend route guards and authentication are not present.

## Folder structure

    Backend/
      SmartTicketManagement.sln
      SmartTicketManagement.API/
      SmartTicketManagement.Application/
      SmartTicketManagement.Domain/
      SmartTicketManagement.Infrastructure/
      tests/SmartTicketManagement.API.Tests/
    Frontend/
      src/app/
        features/home/
        layout/app-shell/
      src/environments/
    docs/
      PHASE_1_IMPLEMENTATION_REPORT.md

## Prerequisites

- .NET SDK 10.
- Node.js 22.12 or later in the supported Node 22 line.
- SQL Server Express instance TEW_SQLEXPRESS for later database work.
- No global Angular CLI is needed.

Angular 21 was generated using npx. The workspace pins npm 11.6.0 because the installed npm 10.9.2 encountered a known peer-resolution defect while resolving Angular 21's Vitest dependency graph. The temporary npm invocation does not change global npm.

## Local database configuration

The API project already defines a `UserSecretsId`, so initializing User Secrets again is not necessary. Configure the per-user `ConnectionStrings:DefaultConnection` value from the repository root:

    dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=.\TEW_SQLEXPRESS;Database=SmartTicketManagementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True" --project Backend/SmartTicketManagement.API/SmartTicketManagement.API.csproj

The API loads User Secrets in Development, and the command above stores the connection string outside source control. `appsettings.Development.example.json` contains the safe local Windows-authentication example only; it is not loaded automatically. The development connection targets `SmartTicketManagementDb`; **this database has not been created**. No migration has been generated or applied, and no existing SQL Server database was changed. The context is intentionally empty until the first domain entities are approved and introduced.

## Run the applications

Start the API from the repository root:

    dotnet run --project Backend/SmartTicketManagement.API/SmartTicketManagement.API.csproj --launch-profile http

The Development profile listens at http://localhost:5073.

- Health: GET http://localhost:5073/api/health
- Swagger UI: http://localhost:5073/swagger
- OpenAPI JSON: http://localhost:5073/swagger/v1/swagger.json

Start the frontend in another PowerShell window:

    cd Frontend
    npx --yes npm@11.6.0 install
    npm.cmd run start

The Angular development server runs at http://localhost:4200. Development API base URL is http://localhost:5073/api; production uses the same-origin /api path. Development CORS allows only http://localhost:4200 and http://127.0.0.1:4200. No wildcard production CORS policy is configured.

## Build and test

From the repository root:

    dotnet build Backend/SmartTicketManagement.sln
    dotnet test Backend/SmartTicketManagement.sln

From Frontend/:

    npm.cmd run build
    npm.cmd run test -- --watch=false

The frontend test command uses Angular's Vitest runner.

## Limitations

- ApplicationDbContext has no entity sets yet; there is no schema, migration, or application database.
- API health confirms API process health only; it does not probe SQL Server.
- The health integration test intentionally supplies an unreachable test-only SQL connection string and proves that the health endpoint does not require a database connection.
- The API and frontend currently expose only foundation behavior; login, ticket operations, and business dashboards are out of scope.
- SQL Server's local connection was supplied as verified for this Phase 1 task, but this implementation did not connect to or modify a database.

See docs/PHASE_1_IMPLEMENTATION_REPORT.md for the file-level report and verification results.
