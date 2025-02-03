# @treasure-dev/tdk-react

## 3.11.0

### Minor Changes

- 010c5f4: Removed `tailwind-merge` dependency for ~7Kb savings in gzipped package
- 6b155cb: Removed Telegram connect method
- 59ab83b: Removed `react-i18n` dependency for ~20Kb savings in gzipped package

### Patch Changes

- 669d3eb: Support for launcher passing wallet
- Updated dependencies [6b155cb]
- Updated dependencies [f9d4f9e]
- Updated dependencies [0b6a789]
- Updated dependencies [669d3eb]
- Updated dependencies [5f751cb]
- Updated dependencies [40ee34c]
  - @treasure-dev/tdk-core@3.11.0
  - @treasure-dev/launcher@1.0.2

## 3.10.0

### Patch Changes

- e1154ae: Ensure initial user login occurs on provided default chain
- Updated dependencies [e1154ae]
  - @treasure-dev/tdk-core@3.10.0

## 3.9.5

### Patch Changes

- b5b9265: Fixed active wallet missing from TDK API client
  - @treasure-dev/tdk-core@3.9.5

## 3.9.4

### Patch Changes

- a03f52e: Fixed `ConnectButton` not resetting state when encountering auth error
- 767178d: Added CRV to View Funds section of connected account modal
- Updated dependencies [767178d]
  - @treasure-dev/tdk-core@3.9.4

## 3.9.3

### Patch Changes

- 34f6153: Updated Tailwind CSS configs to use TypeScript
- e91b0e2: Fixed smart account not created when using `switchChain` to a new chain
  - @treasure-dev/tdk-core@3.9.3

## 3.9.2

### Patch Changes

- 2380371: Update switchChain and smartAccount types
- Updated dependencies [2380371]
  - @treasure-dev/tdk-core@3.9.2

## 3.9.1

### Patch Changes

- 047dbbe: Fixed double account abstraction wrapping of ecosystem wallets
- Updated dependencies [047dbbe]
  - @treasure-dev/tdk-core@3.9.1

## 3.9.0

### Minor Changes

- 5ef7963: Updated Web3 wallet login to use ecosystem wallets

### Patch Changes

- 037e6d2: Fix error where analytics failed to track event immediately on app start
- Updated dependencies [5ef7963]
  - @treasure-dev/tdk-core@3.9.0

## 3.8.0

### Minor Changes

- 95ac5b2: Allow full suite of props on connected account modal

### Patch Changes

- dcc4bc5: Updated `ConnectButton` to fall back to `Blobbie` avatar
- ecc2568: Added ability to specify auth token duration with `authTokenDurationSec` config
- Updated dependencies [ecc2568]
  - @treasure-dev/tdk-core@3.8.0

## 3.7.1

### Patch Changes

- Updated dependencies [d133cb5]
- Updated dependencies [b9b7858]
  - @treasure-dev/tdk-core@3.7.1

## 3.7.0

### Minor Changes

- 3b8bccc: Added legacy user migration flow to connect modal

### Patch Changes

- c9f0393: Moved account factory to be constant address across all chains
- 7262679: Updated connected account modal to show user tag and profile pic when available
- 0412906: Updated ConnectButton to show user tag and profile pic when available
- Updated dependencies [3b8bccc]
- Updated dependencies [c9f0393]
  - @treasure-dev/tdk-core@3.7.0

## 3.6.0

### Patch Changes

- Updated dependencies [64ac715]
- Updated dependencies [41d00c2]
- Updated dependencies [f1e1d53]
  - @treasure-dev/tdk-core@3.6.0

## 3.5.0

### Patch Changes

- 78bb7e6: Remove analytics manager from SSR
- Updated dependencies [78bb7e6]
- Updated dependencies [45fb5a3]
  - @treasure-dev/tdk-core@3.5.0

## 3.4.1

### Patch Changes

- Updated dependencies [084c47d]
  - @treasure-dev/tdk-core@3.4.1

## 3.4.0

### Patch Changes

- Updated dependencies [2ee4c54]
- Updated dependencies [f5ce87e]
- Updated dependencies [a3ce0c1]
- Updated dependencies [f70b149]
- Updated dependencies [e4ac175]
  - @treasure-dev/tdk-core@3.4.0

## 3.3.2

### Patch Changes

- 1bef9be: Fix analytics for no key
- Updated dependencies [1bef9be]
  - @treasure-dev/tdk-core@3.3.2

## 3.3.1

### Patch Changes

- b3d65f6: Updated analytics, device tracking + auto default analytics tracking
- 347d4aa: Set active wallet on TDK API instance to send transactions on ZKsync chains
- 347d4aa: Updated `ConnectButton` connected view to show smart account per selected chain
- Updated dependencies [b3d65f6]
- Updated dependencies [347d4aa]
- Updated dependencies [347d4aa]
  - @treasure-dev/tdk-core@3.3.1

## 3.3.0

### Patch Changes

- Updated dependencies [8ad8dbf]
- Updated dependencies [8ad8dbf]
  - @treasure-dev/tdk-core@3.3.0

## 3.2.2

### Patch Changes

- 4f2c50f: Updated to handle attempts to log in with custom auth endpoint
- Updated dependencies [b82e78b]
- Updated dependencies [4f2c50f]
  - @treasure-dev/tdk-core@3.2.2

## 3.2.1

### Patch Changes

- 074405b: Moved cartridgeTag to analyticsOptions
- Updated dependencies [074405b]
  - @treasure-dev/tdk-core@3.2.1

## 3.2.0

### Patch Changes

- Updated dependencies [b58ec0b]
  - @treasure-dev/tdk-core@3.2.0

## 3.1.0

### Minor Changes

- 399d230: Added support for analytics

### Patch Changes

- Updated dependencies [399d230]
  - @treasure-dev/tdk-core@3.1.0

## 3.0.0

### Major Changes

- d468a1b: Migrated from in-app wallets to ecosystem wallets

### Patch Changes

- 7ef9a60: Added @treasure-dev/launcher package for usage with the launcher
- Updated dependencies [7ef9a60]
- Updated dependencies [d468a1b]
  - @treasure-dev/launcher@1.0.1
  - @treasure-dev/tdk-core@3.0.0

## 2.7.1

### Patch Changes

- 941d2e6: Fixed hardcoded chain options in connected account modal
  - @treasure-dev/tdk-core@2.7.1

## 2.7.0

### Minor Changes

- 01c4c35: Updated user sessions to be fetched through Thirdweb SDK

### Patch Changes

- 750b98e: Fixed file name for CommonJS package exports
- 3d01c9a: Skip extra user session fetch on login
- Updated dependencies [750b98e]
- Updated dependencies [01c4c35]
- Updated dependencies [3d01c9a]
  - @treasure-dev/tdk-core@2.7.0

## 2.6.1

### Patch Changes

- Updated dependencies [291e636]
  - @treasure-dev/tdk-core@2.6.1

## 2.6.0

### Patch Changes

- 28cfa6b: Added X connect method option
- Updated dependencies [28cfa6b]
- Updated dependencies [947e37c]
- Updated dependencies [d9afa84]
  - @treasure-dev/tdk-core@2.6.0

## 2.5.0

### Patch Changes

- Updated dependencies [df6d965]
- Updated dependencies [65d384f]
  - @treasure-dev/tdk-core@2.5.0

## 2.4.0

### Patch Changes

- Updated dependencies [db210bc]
  - @treasure-dev/tdk-core@2.4.0

## 2.3.0

### Patch Changes

- Updated dependencies [0608a3d]
  - @treasure-dev/tdk-core@2.3.0

## 2.2.4

### Patch Changes

- 1cfd245: Fixed connect modal colors
- b9fa738: Disable passkey login option by default
- 550a319: Streamlined error message in connect flow
- 83aab09: Added txOverrides option for creating transactions through TDK API client
- Updated dependencies [83aab09]
  - @treasure-dev/tdk-core@2.2.4

## 2.2.3

### Patch Changes

- b75e4c8: Added connect success and error callbacks
- Updated dependencies [f42c891]
- Updated dependencies [b75e4c8]
- Updated dependencies [0137720]
  - @treasure-dev/tdk-core@2.2.3

## 2.2.2

### Patch Changes

- 34cfc5c: Fix passkey when using redirect for social
- f88258b: Added hideSwitchWallet connected account modal param; set balance token to MAGIC
- 77e0aa7: Disabled connect methods while modal is loading
- Updated dependencies [34cfc5c]
  - @treasure-dev/tdk-core@2.2.2

## 2.2.1

### Patch Changes

- d4d5e77: Added the hideDisconnect prop
  - @treasure-dev/tdk-core@2.2.1

## 2.2.0

### Minor Changes

- 61ec250: Moved thirdweb to peer dependency to share context with consumer apps

### Patch Changes

- c569aa4: Added option for custom auto-connect timeout
- d07b6a1: Added size options to Treasure Connect modal
- d110c16: Added new redirect support
- Updated dependencies [d110c16]
- Updated dependencies [61ec250]
  - @treasure-dev/tdk-core@2.2.0

## 2.1.0

### Minor Changes

- 9b2218d: Enabled chain switching in connected account modal

### Patch Changes

- @treasure-dev/tdk-core@2.1.0

## 2.0.1

### Patch Changes

- 2b4137c: Replaced react-input-verification with input-otp
  - @treasure-dev/tdk-core@2.0.1

## 2.0.0

### Major Changes

- e4dd9d7: Updated Treasure Connect flow to use custom modal

### Patch Changes

- Updated dependencies [e4dd9d7]
  - @treasure-dev/tdk-core@2.0.0

## 1.6.0

### Minor Changes

- 9d7bb39: Allow authentication via redirect. Update thirdweb sdk to latest and remove old param authenticatorType from passkey auth

### Patch Changes

- Updated dependencies [9d7bb39]
- Updated dependencies [6e391d7]
  - @treasure-dev/tdk-core@1.6.0

## 1.5.0

### Minor Changes

- f4ff171: Removed payments module hooks, utils and components

### Patch Changes

- 59f25c3: Removed global base CSS styles from package
- Updated dependencies [f4ff171]
- Updated dependencies [9e56447]
  - @treasure-dev/tdk-core@1.5.0

## 1.4.1

### Patch Changes

- d25ce6b: Temporarily allow consumer apps to specify auth options
  - @treasure-dev/tdk-core@1.4.1

## 1.4.0

### Patch Changes

- 361c861: Added telegram to social login options
- Updated dependencies [361c861]
- Updated dependencies [72d45e9]
- Updated dependencies [ea0053b]
- Updated dependencies [ac072df]
  - @treasure-dev/tdk-core@1.4.0

## 1.3.0

### Patch Changes

- 7494c70: Added Farcaster social auth option
- a2de146: Exposed the useConnect hook
- Updated dependencies [af94875]
- Updated dependencies [f272eb2]
  - @treasure-dev/tdk-core@1.3.0

## 1.2.0

### Minor Changes

- 1ab9e76: Added Discord login option

### Patch Changes

- Updated dependencies [eeb81b0]
- Updated dependencies [1ab9e76]
- Updated dependencies [1ab9e76]
  - @treasure-dev/tdk-core@1.2.0

## 1.1.0

### Minor Changes

- cffb8e3: Added Treasure Connect login functions to core package

### Patch Changes

- Updated dependencies [cffb8e3]
- Updated dependencies [fea2894]
  - @treasure-dev/tdk-core@1.1.0

## 1.0.1

### Patch Changes

- 1ae01e6: Fixed wallet disconnect not dismissing account modal
  - @treasure-dev/tdk-core@1.0.1

## 1.0.0

### Major Changes

- 5fa7564: Updated primary login method to connect modal flow

### Patch Changes

- Updated dependencies [5fa7564]
  - @treasure-dev/tdk-core@1.0.0

## 0.2.8

### Patch Changes

- Updated dependencies [fd71069]
  - @treasure-dev/tdk-core@0.2.8

## 0.2.7

### Patch Changes

- 2bd76e8: Removed unused files and exports
- Updated dependencies [786c1c7]
- Updated dependencies [64d48ee]
- Updated dependencies [2bd76e8]
  - @treasure-dev/tdk-core@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [c5dc87b]
- Updated dependencies [59caa63]
  - @treasure-dev/tdk-core@0.2.6

## 0.2.5

### Patch Changes

- Updated dependencies [14b01be]
  - @treasure-dev/tdk-core@0.2.5
