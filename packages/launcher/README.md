# Treasure Launcher

Treasure Launcher utilities for the Treasure ecosystem

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)

## Installation

```bash
pnpm add @treasure-dev/launcher
```

## Usage

### Using vanilla JavaScript

#### Get auth token

```ts
import { getTreasureLauncherAuthToken } from "@treasure-dev/launcher";

const authToken = getTreasureLauncherAuthToken();
```

#### Check if using Treasure Launcher

```ts
import { isUsingTreasureLauncher } from "@treasure-dev/launcher";

const usingLauncher = isUsingTreasureLauncher();
```

#### Start user session

```ts
import { startUserSessionViaLauncher } from "@treasure-dev/launcher";

await startUserSessionViaLauncher({
    backendWallet: "0x...",
    approvedTargets: ["0x..."],
    nativeTokenLimitPerTransaction: 100,
    sessionDurationSec: 60 * 60 * 24 * 7,
    sessionMinDurationLeftSec: 60 * 60 * 24 * 3,
});
```

### Using React

#### Check if using Treasure Launcher

```ts
import { useTreasure } from "@treasure-dev/react";

const { isUsingTreasureLauncher } = useTreasure();
```

#### Start user session via Treasure Launcher

Use `startUserSession` as usual:

```ts
import { useTreasure } from "@treasure-dev/react";

const { startUserSession } = useTreasure();
```

### Using Electron + React

```ts Main.ts
import { getTreasureLauncherAuthToken } from "@treasure-dev/launcher";

ipcMain.on("get-auth-token", (event, _arg) => {
    event.returnValue = getTreasureLauncherAuthToken();
});
```

```ts Main.tsx
const getAuthToken = () =>
  window.electron.ipcRenderer.sendSync("get-auth-token");

<TreasureProvider
 ...
    launcherOptions={{
        getAuthTokenOverride: getAuthToken,
    }}
>
```

## Deployment

Merge [changeset-bot](https://github.com/apps/changeset-bot)'s versioning PR to the `main` branch to push a new package version to npm.
