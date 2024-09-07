# Treasure Auth

Authentication token utilities for the Treasure ecosystem

## Prerequisites

- [>= Node 20.11.0](https://nodejs.org/en)

## Installation

```bash
npm i @treasure-dev/auth
```

## Usage

### Generate JWT

```ts
import { createAuth } from "@treasure-dev/auth";

const auth = createAuth({
  kmsRegion: "us-west-2",
  kmsKeyArn: "arn:kms-auth",
});

try {
  const token = await auth.generateJWT("engineer1", {
    email: "engineering@treasure.lol",
  });
} catch (err) {
  console.error("Error generating JWT:", err);
}
```

### Verify JWT

```ts
import { createAuth } from "@treasure-dev/auth";

type User = {
  email: string;
};

const auth = createAuth({
  kmsRegion: "us-west-2",
  kmsKeyArn: "arn:kms-auth",
});

try {
  const user = await auth.verifyJWT<User>("ey...");
  console.log(user.ctx.email); // engineering@treasure.lol
} catch (err) {
  console.error("Error verifying JWT:", err);
}
```

## Deployment

Merge [changeset-bot](https://github.com/apps/changeset-bot)'s versioning PR to the `main` branch to push a new package version to npm.
