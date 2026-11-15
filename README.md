# Smart Ticket Management System

## Project Overview

A fresher-level portfolio application for managing support tickets across EndUser, SupportAgent, SupportManager, and Admin roles. The application is planned as an independently authored project with an Angular frontend, ASP.NET Core API, and SQL Server database.

**Status: Planning / Phase 0.** Application code has not been created. Features described here are planned, not implemented.

## Project Objectives

- Build a complete frontend-to-API-to-database workflow.
- Enforce authentication, role permissions, and ticket-specific access on the backend.
- Keep ticket lifecycle, assignment, and SLA rules understandable and testable.
- Provide a professional, responsive user experience.
- Add focused automated tests and accurate setup documentation.
- Keep the application small enough to explain and demonstrate confidently.

## Technology Stack

- C# and ASP.NET Core Web API on .NET 10 LTS
- Entity Framework Core and Microsoft SQL Server
- Angular 21, TypeScript, HTML5, CSS3, and Angular Material
- JWT bearer authentication and BCrypt password hashing
- xUnit, ASP.NET Core integration tests, and Angular testing

Exact patch versions and compatible dependencies will be pinned during Phase 1. Current environment readiness is recorded in docs/PHASE_0_PROJECT_BASELINE.md.

## Application Roles

- **EndUser:** submit and track own tickets, comment, and perform eligible cancel/reopen/escalation actions.
- **SupportAgent:** work currently assigned tickets, update valid statuses, comment, and view history.
- **SupportManager:** view all system tickets, including cancelled/history; assign eligible agents and review operational reports.
- **Admin:** manage users/roles and ticket master data; read sanitized ticket data and reports without ticket mutation or comment creation.

All permissions are planned. Backend authorization will be authoritative; Angular guards are for navigation only.

## Core Features

Planned MVP:

- Pending user registration, Admin approval, single-role assignment, and login.
- Ticket creation, categorized priority, role-filtered lists, and ticket details.
- Validated ticket status lifecycle and manager-controlled assignment.
- Ordinary ticket comments and activity history.
- Creator-only escalation and basic priority-based SLA due dates.
- Role dashboards, basic database-backed reports, validation, and consistent errors.
- Unit and API integration tests for security and business rules.

## Project Architecture

The planned architecture is a lightweight layered modular monolith: API, Application, Domain, and Infrastructure projects, plus a feature-organized Angular application. It is designed for one local API, one frontend, and one SQL Server database. See docs/ARCHITECTURE.md.

## Folder Structure

Current Phase 0 structure:

    docs/
    README.md
    .gitignore
    .git/

Backend and Frontend are reserved for Phase 1; application scaffolding has not been created.

## Development Status

- Phase 0: project baseline and decisions.
- Phase 1: backend/frontend foundations — not started.
- All application features are planned and unimplemented.

## Setup Instructions

To be completed during implementation. The intended stack requires a supported .NET 10 SDK, a Node.js version compatible with Angular 21, npm, SQL Server, and Angular CLI tooling. No setup/build/run commands are documented as validated yet.

## Testing

Planned: xUnit unit tests, ASP.NET Core API integration tests, and Angular tests. No tests have been created or run.

## Future Improvements

Only after the MVP is working and tested: optional least-loaded auto-assignment, email notifications, real-time updates, export, or additional reporting. Microservices, Kubernetes, multi-tenancy, SSO, queues, and distributed caching are outside the current scope.
