# Design Nexus Frontend

The Design Nexus frontend is a React + TypeScript application built with Vite.

It provides the user-facing experience for clients and designers and communicates with the backend through the YARP API Gateway.

The frontend was developed as a major part of the original collaborative team project, primarily by [@EslamiRaziyeh84](https://github.com/EslamiRaziyeh84).

## Key Features

The frontend includes interfaces and flows for:

- User registration and login
- Email and OTP verification
- Forgot-password and password-reset flows
- Designer discovery
- Designer profile views
- Portfolio browsing
- Portfolio filtering by category
- Portfolio creation and editing
- User profile management
- Client and designer dashboards
- Project request creation
- Project request management
- Request status tracking

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Nginx for the containerized frontend setup

## Project Structure

The frontend is organized primarily by feature:

```text
src/
├── features/
│   ├── auth/
│   ├── chat/
│   ├── media/
│   ├── ordering/
│   ├── support/
│   └── view/
│
├── shared/
│   ├── assets/
│   ├── components/
│   ├── styles/
│   └── utils/
│
└── styles/
```

Feature modules contain their related pages, components, styles, and API integration code.

For example:

- `auth` — registration, login, verification, and password flows
- `media` — user/designer panels and portfolio-related functionality
- `ordering` — project request/order flows
- `view` — designers, portfolios, categories, and profile views
- `support` — support-related UI
- `chat` — chat-related interfaces included in the original project

## Backend Integration

The frontend communicates with the backend through the YARP API Gateway rather than managing each backend service independently.

```text
React / TypeScript Client
          |
          v
     YARP Gateway
       /   |   \
      v    v    v
    IAM Portfolio Request
```

Frontend API modules are organized alongside their related features and send requests to the Gateway.

The Gateway is responsible for forwarding those requests to the appropriate backend service.

## Configuration

Create a local environment file from the provided example:

```bash
cp .env.example .env
```

The primary frontend environment value is:

```env
VITE_API_URL=http://localhost:5157
```

This value defines the address of the Design Nexus API Gateway.

Local `.env` files should not be committed to Git.

## Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

## Production Build

Create a production build with:

```bash
npm run build
```

Generated build output is excluded from Git.

## Team Context

Design Nexus was developed collaboratively.

- **Mostafa Nasrollahpour** — primarily backend services, authentication, persistence, API Gateway, service integration, and infrastructure.
- **[@EslamiRaziyeh84](https://github.com/EslamiRaziyeh84)** — primarily frontend development, user-facing flows, UI implementation, and frontend/backend integration.

The original Git history has been preserved so the contribution history of both developers remains visible.

## Related Documentation

- [Main Project README](../README.md)
- [Backend Documentation](../Backend/README.md)
- [Architecture Documentation](../docs/architecture.md)