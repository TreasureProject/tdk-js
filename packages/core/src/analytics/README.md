# TDK Core Analytics

Module for interacting with Treasure’s Data Platform (codename Darkmatter) — a powerful, scalable and real-time streaming analytics service that allows developers to collect data from games. 

## Installation

```bash
pnpm add @treasure-dev/tdk-core
```

## Usage

```typescript
import { AnalyticsManager } from "@treasure-dev/tdk-core";

AnalyticsManager.instance.init({
    apiUri: "{DARKMATTER_API_BASE_URI}",
    xApiKey: "YOUR_X_API_KEY",
    app: {
        app_identifier: "YOUR_APP_IDENTIFIER",
        app_version: "YOUR_APP_VERSION",
        app_environment: 0, // 0 for dev, 1 for prod
    },
});

// Track a custom event
await AnalyticsManager.instance.trackCustomEvent({
    smart_account: "YOUR_SMART_ACCOUNT_ADDRESS", // And/or `user_id`
    cartridge_tag: "YOUR_CARTRIDGE_TAG",
    name: "YOUR_EVENT_NAME",
    properties: {
        // Add any additional properties here
    },
});
```
