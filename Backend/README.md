# Design Nexus Backend

The Design Nexus backend follows a microservices architecture composed of a YARP API Gateway and three independently structured ASP.NET Core services: **IAM**, **Portfolio**, and **Request**.

The backend uses PostgreSQL for persistent data, Redis for temporary authentication-related data, Entity Framework Core for persistence, MediatR for application request handling, and YARP as the API Gateway.

Each service has its own application boundary and persistence layer. IAM, Portfolio, and Request use separate PostgreSQL databases, while cross-service data is accessed through HTTP communication rather than direct access to another service's database.

> This backend was developed as part of a collaborative team project and is presented here as a portfolio codebase. It should not be treated as production-ready without additional validation and hardening.

## Structure

```text
Backend/
├── Backend.sln
├── docker-compose.yml
└── src/
    ├── gateway/
    │   └── Gateway/
    └── services/
        ├── iam/
        │   ├── IAM.Api/
        │   ├── IAM.Application/
        │   ├── IAM.Domain/
        │   ├── IAM.Infrastructure/
        │   └── IAM.Tests/
        ├── portfolio/
        │   ├── PortFolioService.Api/
        │   ├── PortFolioService.Application/
        │   ├── PortFolioService.Domain/
        │   ├── PortFolioService.Infrastructure/
        │   └── PortFolioService.Tests/
        └── request/
            ├── Request.Api/
            ├── Request.Application/
            ├── Request.Domain/
            ├── Request.Infrastructure/
            └── Request.Tests/
```

## Architectural Approach

Each business service is split into projects with responsibilities similar to a layered / Clean-Architecture-inspired structure.

### API

Responsible for HTTP endpoints, controllers, dependency injection, authentication/authorization configuration, middleware, and Swagger/OpenAPI.

### Application

Contains application use cases, commands, queries, MediatR handlers, DTOs, and application-level abstractions.

### Domain

Contains domain entities, enums, core business models, and domain-level contracts where applicable.

### Infrastructure

Contains implementation details such as Entity Framework Core, PostgreSQL repositories, Redis, email delivery, file/media services, and internal HTTP clients.

The structure is intentionally practical rather than being presented as a strict implementation of every Clean Architecture or DDD rule.

## Services

### IAM Service

Responsibilities include:

- User registration and login
- Password hashing
- JWT access tokens
- Refresh tokens
- OTP generation and verification
- Redis-backed OTP expiration
- Password recovery/change flows
- User updates
- Authentication and authorization

IAM owns its own PostgreSQL database. Redis is used for temporary authentication-related data, and MailKit is used for SMTP email delivery.

### Portfolio Service

Responsibilities include:

- Designer profiles
- Portfolio creation and updates
- Portfolio retrieval
- Recent portfolios
- Category-based queries
- Portfolio items
- Media/file handling
- Uploaded-file validation
- File deletion and cleanup

Portfolio owns its own PostgreSQL database and communicates with IAM over HTTP when user or designer information is required.

### Request Service

Responsibilities include:

- Project-request creation
- Designer selection
- Category validation
- Deadline validation
- Request retrieval by requester
- Request retrieval by designer
- Request-status updates
- Authorization checks around request operations

Request owns its own PostgreSQL database and communicates with IAM when user/designer information is needed.

### API Gateway

The Gateway is implemented with **YARP Reverse Proxy** and provides a single application-facing entry point.

```text
Client
  |
  v
YARP Gateway
  |
  +--> IAM
  +--> Portfolio
  +--> Request
```

## Data Ownership

Each service owns its persistent data:

```text
IAM       -> IAM PostgreSQL Database
Portfolio -> Portfolio PostgreSQL Database
Request   -> Request PostgreSQL Database
```

Services do not directly query each other's databases. Cross-service information is retrieved through service APIs.

## Authentication and OTP

IAM issues JWT access tokens used by protected endpoints.

OTP verification uses Redis for temporary storage and expiration:

```text
Generate OTP
    |
    v
Store in Redis
    |
    v
Send by email
    |
    v
Validate submitted OTP
```

## Service-to-Service Communication

Portfolio and Request use synchronous HTTP when they need information owned by IAM:

```text
Portfolio ----HTTP----> IAM
Request   ----HTTP----> IAM
```

For the scope of this project, this keeps the architecture straightforward without introducing a message broker without a concrete requirement.

## File Upload Handling

The Portfolio service includes validation around uploaded media, including:

- File size
- MIME type
- Supported formats
- File signatures

Image handling includes formats such as JPEG, PNG, and WebP.

Files are stored locally for the scope of the project. A production deployment would normally consider dedicated object storage.

## Tech Stack

- ASP.NET Core
- C#
- Entity Framework Core
- PostgreSQL
- Redis
- MediatR
- YARP
- JWT Authentication
- BCrypt
- MailKit
- Swagger / OpenAPI
- xUnit
- Moq
- Docker
- Docker Compose

## Configuration

Sensitive values should not be committed to the repository.

Typical local configuration includes:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-local-password
JWT_SECRET=your-local-jwt-secret
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@example.com
```

Use environment variables, local files excluded from Git, .NET User Secrets, or an appropriate secret-management solution for real credentials.

## Local Development

At minimum, backend development requires:

- A compatible .NET SDK
- PostgreSQL
- Redis

Restore dependencies:

```bash
cd Backend
dotnet restore
```

Individual API projects can then be started with `dotnet run` after local configuration is provided.

Because this repository is a portfolio snapshot of the completed team project, some local configuration may need adjustment before all services run together.

## Docker

Dockerfiles are included for the Gateway and backend services, and Docker Compose configuration is included for the application stack.

The original project included containerization work for the Gateway, IAM, Portfolio, Request, PostgreSQL, Redis, and frontend.

The Docker configuration should be validated against the local environment before being treated as deployment-ready.

## API Documentation

ASP.NET Core APIs include Swagger/OpenAPI configuration for development-time exploration.

Main API areas include:

- Authentication
- User management
- Designer profiles
- Portfolios
- Portfolio categories
- Project requests
- Request status management

## Testing

Backend test projects are included in the solution and use tools such as xUnit and Moq.

Current automated test coverage is limited and should not be interpreted as comprehensive production-level coverage.

## Known Limitations

- Automated test coverage is limited.
- Portfolio media uses local storage rather than object storage.
- Inter-service communication is synchronous HTTP.
- Authentication key management is intentionally simple for the project scope.
- Production observability, distributed tracing, high availability, and production secret management are outside the original project scope.

## Related Documentation

- [Main Project README](../README.md)
- [Architecture Documentation](../docs/architecture.md)
- [Frontend Documentation](../Frontend/README.md)
