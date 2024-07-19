# Treasure Development Kit

SDK for the Treasure ecosystem

## Apps

- [@treasure-dev/tdk-api](./apps/api)
- [@treasure-dev/tdk-login](./apps/login)

## Packages

- [@treasure-dev/tdk-core](./packages/core)
- [@treasure-dev/tdk-react](./packages/react)

## Examples

- [Treasure Connect (Core)](./examples/connect-core)
- [Treasure Connect (React)](./examples/connect-react) - [Live Demo](https://tdk-examples-connect.vercel.app)
- [Harvester](./examples/harvester) - [Live Demo](https://tdk-examples-harvester.vercel.app)
- [Payments](./examples/payments)

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

Start any supplemental apps:

```bash
$ npm run dev:login
```

### Contributing

Before creating a PR, add a [changeset](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md) to your commit:

```bash
npm run changeset
```
