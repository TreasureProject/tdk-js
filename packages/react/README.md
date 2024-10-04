# TDK React

Treasure Development Kit for React-based projects

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)
- [React 18.2.0](https://github.com/facebook/react/blob/main/CHANGELOG.md#1820-june-14-2022)

## Installation

```bash
pnpm add @treasure-dev/tdk-react
```

## Usage

[Documentation](https://docs.treasure.lol/tdk/react/getting-started)

## Development

In the root directory of the `tdk-js` project, install dependencies:

```bash
pnpm install
```

Start the package in development mode to listen for changes:

```bash
pnpm dev
```

Use [Storybook](https://storybook.js.org) to preview development of UI components by running the following command in the `packages/react` directory:

```bash
pnpm storybook
```

## Deployment

Merge [changeset-bot](https://github.com/apps/changeset-bot)'s versioning PR to the `main` branch to push a new package version to npm.
