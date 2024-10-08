# Treasure Connect - Electron Example

Example showing how Electron-based apps can interact with the Treasure Development Kit's Treasure Connect feature, powering login flows and account abstraction.

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)
- Running [TDK API](../../apps/api)

## Development

Install dependencies:

```bash
pnpm install
```

In the workspace root folder, run the Electron install script:

```bash
node ./node_modules/electron/install.js
```

Create `.env` file based on example and fill in with relevant environment variables:

```bash
cp .env.example .env
```

Start application:

```bash
pnpm dev
```
