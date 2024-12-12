# Magicswap API

Backend server powering the Treasure ecosystem's automated market maker Magicswap

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)
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

Start server:

```bash
pnpm dev
```

## Deployment

Merge to the `main` branch to deploy to the development environment.

Add a tag with the `magicswap-api-v` prefix to deploy to the production environment (e.g., `magicswap-api-v1.0.0`).
