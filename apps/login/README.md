# TDK Login

Front-end UI for the Treasure Development Kit login flow

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)
- Running [TDK API](../api)

## Development

Install dependencies:

```bash
npm install
```

Create `.env` file based on example and fill in with relevant environment variables:

```bash
cp .env.example .env
```

Start server:

```bash
npm run dev
```

## Deployment

Merge to the `main` branch to deploy to the development environment.

Add a tag with the `login-v` prefix to deploy to the production environment (e.g., `login-v1.0.0`).
