# Treasure Development Kit

SDK for the Treasure ecosystem

## Apps

- [@treasure-dev/tdk-api](./apps/api)

## Packages

- [@treasure-dev/tdk-core](./packages/core)
- [@treasure-dev/tdk-react](./packages/react)
- [@treasure-dev/tailwind-config](./packages/tailwind-config)

## Examples

- [Treasure Connect (Core)](./examples/connect-core)
- [Treasure Connect (React)](./examples/connect-react) - [Live Demo](https://tdk-examples-connect.vercel.app)
- [Treasure Connect (Electron)](./examples/connect-electron)
- [Magicswap](./examples/magicswap)

## Development

### Setup

Install dependencies:

```bash
npm install
```

Open the `README.md` files for the apps and examples you are contributing to and follow the instructions to finish configuring the packages.

Start watch mode for base workspaces:

```bash
npm run dev
```

Start any example apps:

```bash
$ cd examples/connect-react
$ npm run dev
```

### Contributing

Before creating a PR, add a [changeset](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md) to your commit:

```bash
npm run package:changeset
```
