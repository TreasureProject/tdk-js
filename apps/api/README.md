# TDK API

Backend server powering the Treasure Development Kit

## Prerequisites

- [>= Node 22.12.0](https://nodejs.org/en)
- [Docker Compose](https://docs.docker.com/compose/install/)
- AWS credentials set up for Secrets Manager and Key Management Service access

## Development

Install dependencies:

```bash
pnpm install
```

Create `.env` file based on example and fill in with relevant environment variables:

```bash
cp .env.example .env
```

Generate database client:

```bash
pnpm generate
```

Start server:

```bash
pnpm dev
```

## Deployment

Merge to the `main` branch to deploy to the development environment.

Add a tag with the `api-v` prefix to deploy to the production environment (e.g., `api-v1.0.0`).
