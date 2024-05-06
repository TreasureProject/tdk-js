# TDK API

Backend server powering the Treasure Development Kit

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)
- [PostgreSQL](https://www.postgresql.org) server

## Development

Install dependencies:

```bash
npm install
```

Create `.env` file based on example and fill in with relevant environment variables:

```bash
cp .env.example .env
```

Generate database client:

```bash
npm run generate
```

Create initial tables in database:

```bash
npm run db:migrate
```

Seed database with development values:

```bash
npm run db:seed
```

Start server:

```bash
npm run dev
```

## Deployment

Merge to the `main` branch to deploy to the development environment.

Add a tag with the `api-v` prefix to deploy to the production environment (e.g., `api-v1.0.0`).
