# Treasure Development Kit - Backend-to-Backend Example

Examples showing how to use the vanilla JS/TS (core) Treasure Development Kit package to send backend-to-backend transaction requests. There are currently two supported flows:

1. `account-address`: sending transactions on behalf of a Treasure Account user who has already started a session for the provided backend wallet.
2. `backend-wallet`: sending transactions as a backend wallet.

## Prerequisites

- [>= Node 22.12.0](https://nodejs.org/en)
- AWS KMS-configured backend wallet ([see docs](https://docs.treasure.lol/tdk/core/backend-to-backend) to learn more)

## Development

Install dependencies:

```bash
pnpm install
```

Create `.env` file based on example and fill in with relevant environment variables:

```bash
cp .env.example .env
```

Run scripts:

```bash
$ pnpm start:account-address
$ pnpm start:backend-wallet
```
