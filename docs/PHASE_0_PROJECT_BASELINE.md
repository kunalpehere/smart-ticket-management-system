# Phase 0 — Project Baseline

## 1. Project identity and objective

- **Name:** Smart Ticket Management System — Independent Implementation
- **Root:** C:\Users\244234\Desktop\Resume Project\Eaton\smart-ticket-management-system-independent
- **Objective:** Build an independently authored, fresher-level ticketing application demonstrating a working Angular/API/SQL Server workflow, correct authorization, explicit lifecycle rules, useful UI, and focused tests.
- This root is separate from any reference project. Do not copy code, UI, assets, or proprietary details.

## 2. Confirmed technology stack

- C# / ASP.NET Core Web API / .NET 10 LTS
- EF Core and Microsoft SQL Server
- Angular 21, TypeScript, HTML5, CSS3, Angular Material
- JWT bearer authentication and BCrypt hashing
- xUnit, ASP.NET Core integration testing, Angular testing
- VS Code, Codex, Git/GitHub, Postman, SQL client

Exact package patches are deferred to Phase 1. Angular Node compatibility is recorded in docs/PROJECT_OVERVIEW.md and based on Angular’s official version table; verify exact pinned package/tool versions when scaffolding.

## 3. Architecture choice

The confirmed T6 choice is a lightweight layered modular monolith: API, Application, Domain, Infrastructure, and a feature-organized Angular frontend. One local API, one UI, and one SQL Server database. No microservices, queues, Kubernetes, multi-tenancy, or generic repository framework in the MVP. See docs/ARCHITECTURE.md.

## 4. Existing documentation inventory

All six T6 documents were present and preserved:

- docs/PROJECT_OVERVIEW.md
- docs/ARCHITECTURE.md
- docs/DATABASE_DESIGN.md
- docs/AUTHORIZATION_MATRIX.md
- docs/API_DESIGN.md
- docs/DEVELOPMENT_ROADMAP.md

README.md and .gitignore were absent at inspection and created for Phase 0. This file records the baseline. No existing T6 document was rewritten or renamed.

## 5. Initial and final directory structure

At initial inspection the project root contained only docs/ and the six T6 documents. No README, .gitignore, .git repository, Backend, or Frontend directory existed.

After Phase 0:

    smart-ticket-management-system-independent/
    ├── .git/
    ├── .gitignore
    ├── README.md
    └── docs/
        ├── API_DESIGN.md
        ├── ARCHITECTURE.md
        ├── AUTHORIZATION_MATRIX.md
        ├── DATABASE_DESIGN.md
        ├── DEVELOPMENT_ROADMAP.md
        ├── PHASE_0_PROJECT_BASELINE.md
        └── PROJECT_OVERVIEW.md

Backend/ and Frontend/ remain intentionally absent until Phase 1. No application scaffolding was created.

## 6. Installed tools and versions

| Tool | Observed status | Compatibility/readiness |
|---|---|---|
| Git | 2.46.2.windows.1 | Available. Global commit identity is configured. Repository initialized in this exact root and baseline committed; see final report for commit hash. |
| .NET SDK | 7.0.400 only | **Not ready:** .NET 10 SDK is absent. No SDK/runtime was installed. |
| .NET runtimes | Microsoft.NETCore.App and Microsoft.AspNetCore.App 6.0.21/23, 7.0.10/14, 8.0.34; WindowsDesktop 6.0.21/23, 7.0.10/14, 8.0.34 | .NET 10 runtime not present. Listing versions does not establish app compatibility. |
| Node.js | v22.14.0 | Suitable for Angular 21 per the compatibility range documented in T6’s PROJECT_OVERVIEW.md; exact Angular packages not installed. |
| npm | 10.9.2 | Available. Project does not yet pin its package manager version. |
| Angular CLI | ng not found | Not installed/detected. Add as a project-local Phase 1 dependency only when authorized. |
| SQL Server tooling | sqlcmd command available | Client command detected; no database connection attempted. |
| SQL Server engine/service | Not verified | Service enumeration failed because the sandbox could not access Service Control Manager. No SQL Server process/connection check was made. Requires later setup/verification. |
| SSMS / Azure Data Studio | Commands not found | Not detected by command lookup. Another SQL client may be installed under a nonstandard path; not verified. |
| VS Code CLI | code reports 1.145.3, x64 | Detected. CLI emitted a sandbox EPERM while changing directories; editor launch was not tested. |

Environment checks used version/availability commands only. No software was installed or updated.

## 7. Missing prerequisites

Before Phase 1 setup/build verification:

- Install or otherwise make available the .NET 10 SDK.
- Install Angular CLI as a local project dependency during frontend scaffolding; no global CLI is required by this baseline.
- Confirm a local SQL Server instance/edition is available and document safe developer connection setup. sqlcmd availability alone does not prove an engine is installed or running.
- Choose/pin exact Angular, TypeScript, RxJS, EF Core, and npm versions consistent with official compatibility guidance.
- Decide how local secrets are stored (for example, user-secrets/environment variables); never commit real credentials.
- Resolve shell/VS Code CLI permission behavior only if it prevents normal editor use.

Do not install or configure these during Phase 0.

## 8. Git status and initial commit

At inspection, this exact root had no .git directory and Git reported it was not a repository. Git global user.name and user.email were configured (values intentionally omitted here). Phase 0 initialized Git only in this root, reviewed the candidate files, staged the intended README, .gitignore, and documentation, and created the initial commit:

    chore: establish independent project baseline

The final report records the commit hash and clean status. No remote was added and Git configuration was not changed.

## 9. .gitignore decisions

Created a focused .gitignore for .NET build output, Angular/Node generated files, IDE user state, local environment/secrets, logs/temp files, and local SQL Server database files. .env.example is explicitly allowed. README, docs, application source, package manifests, project files, and future EF migrations are not ignored.

## 10. README status

Created README.md with all requested sections. It clearly labels the application as planning/Phase 0 and all features as planned; it makes no claim of a working or deployed app. Setup instructions remain marked for later validation.

## 11. Security and secret-management principles

- Never commit JWT signing keys, database passwords, tokens, user passwords, or real .env files.
- Keep local secrets in user-secrets/environment configuration; commit only safe examples with placeholder values.
- Store password hashes, never plaintext passwords; exclude hashes/tokens from all API DTOs and logs.
- Derive user ID and role from validated JWT claims, not request-body or Angular localStorage values.
- Enforce resource authorization in backend application services; frontend guards are UX only.
- Use one effective role per user; do not depend on claim ordering.
- Development seed accounts, if later added, must be development-only and documented as disposable.

## 12. Scope boundaries

MVP: authentication/approval, four roles, ticket create/list/detail, lifecycle, manager assignment, comments/history, escalation, simple priority SLA, dashboards/reports, validation, consistent errors, and meaningful tests.

Excluded for now: microservices, Kubernetes, multi-tenancy, SSO, distributed queues/cache, complex approval chains, private comments, complex business-hours SLA jobs, and production deployment. Auto-assignment is optional after manual assignment is correct.

## 13. Deferred decisions

Carry forward T6 decisions; do not silently change them.

- Whether SupportManager may reassign an InProgress ticket.
- Exact EndUser cancellation eligibility for an Assigned ticket.
- Final report fields needing business clarification.
- Any future team/tenant boundary; default remains one system-wide scope.
- Admin role changes after approval and audit details.

The T6 database design already recommends that reopened tickets retain their original SLA due date. This is the current design default, not an open Phase 0 decision; revisit only if requirements change.

## 14. Phase 0 completion checklist

- [x] Exact independent project root inspected; only six T6 documents existed initially.
- [x] All six T6 documents verified and preserved.
- [x] Tool versions/availability checked without installing software or connecting to services.
- [x] .gitignore created and reviewed.
- [x] README skeleton created with planned/unimplemented status clearly labeled.
- [x] Phase 0 baseline and deferred decisions documented.
- [x] Git initialized in the exact root; only intended project files committed.
- [x] Final repository status is clean and no remote exists.
- [x] No Backend/Frontend scaffolding, source code, package install, database, build, test, migration, or runtime was created or executed.

Phase 0 is complete. Phase 1 has not started.
