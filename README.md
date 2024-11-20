# Treasure Development Kit

SDK for the Treasure ecosystem

## Apps

- [@treasure-dev/tdk-api](./apps/api)

## Packages

- [@treasure-dev/auth](./packages/auth)
- [@treasure-dev/tdk-core](./packages/core)
- [@treasure-dev/tdk-react](./packages/react)
- [@treasure-dev/tailwind-config](./packages/tailwind-config)
- [@treasure-dev/launcher](./packages/launcher)

## Examples

- [Treasure Connect (Core)](./examples/connect-core)
- [Treasure Connect (React)](./examples/connect-react) - [Live Demo](https://tdk-examples-connect.vercel.app)
- [Treasure Connect (Electron)](./examples/connect-electron)
- [Magicswap](./examples/magicswap) - [Live Demo](https://tdk-examples-magicswap.vercel.app)

## Development

### Setup

Install dependencies:

```bash
pnpm install
```

Open the `README.md` files for the apps and examples you are contributing to and follow the instructions to finish configuring the packages.

Start watch mode for base workspaces:

```bash
pnpm dev
```

Or start watch mode for specific example app:

```bash
pnpm dev:react
```

### Contributing

Before creating a PR, add a [changeset](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md) to your commit:

```bash
pnpm package:changeset
```
