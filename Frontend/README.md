# Design Nexus Frontend

The Design Nexus frontend is a React + TypeScript client built with Vite.

It provides the user-facing interface for the platform and communicates with the backend through the API Gateway.

> This frontend was developed as part of the original collaborative team project.

## Tech Stack

- React
- TypeScript
- Vite
- Nginx for the containerized frontend setup

## Configuration

Create a local environment file from the provided example:

```bash
cp .env.example .env
```

The primary frontend environment value is:

```env
VITE_API_URL=http://localhost:5157
```

This points the frontend to the Design Nexus API Gateway.

Do not commit real local `.env` files.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Production Build

Create a production build with:

```bash
npm run build
```

Generated build output is not committed to Git.

## Backend Communication

The frontend is designed to communicate through the YARP API Gateway:

```text
React Client
     |
     v
API Gateway
     |
     +--> IAM Service
     +--> Portfolio Service
     +--> Request Service
```

## Project Context

Design Nexus was developed collaboratively.

Backend and infrastructure work was primarily handled by **Mostafa Nasrollahpour**, while **[@EslamiRaziyeh84](https://github.com/EslamiRaziyeh84)** made substantial contributions to the frontend and overall project development.

The original Git history is preserved so contribution history remains visible.

## Related Documentation

- [Main Project README](../README.md)
- [Backend Documentation](../Backend/README.md)
- [Architecture Documentation](../docs/architecture.md)
