# @treasure-dev/tdk-core

## 3.5.0

### Minor Changes

- 45fb5a3: Added helpers for fetching minimal Magicswap pool payloads

### Patch Changes

- 78bb7e6: Remove analytics manager from SSR

## 3.4.1

### Patch Changes

- 084c47d: Updated `backendWallet` to remain an optional field in transaction payloads

## 3.4.0

### Minor Changes

- a3ce0c1: Updated Magicswap helpers to support Topaz testnet
- f70b149: Removed deprecate Project API helper and type
- e4ac175: Removed Treasure Ruby chain support

### Patch Changes

- 2ee4c54: Updated user transactions API helper to fetch by user ID
- f5ce87e: Added fetch user public profile to API client

## 3.3.2

### Patch Changes

- 1bef9be: Fix analytics for no key

## 3.3.1

### Patch Changes

- b3d65f6: Updated analytics, device tracking + auto default analytics tracking
- 347d4aa: Added `getUserAddress` utility for looking up user smart account address by chain ID
- 347d4aa: Updated send transaction functions to use active wallet on ZKsync chains

## 3.3.0

### Minor Changes

- 8ad8dbf: Updated format of JWT user context payload
- 8ad8dbf: Added Treasure Topaz testnet details

## 3.2.2

### Patch Changes

- b82e78b: Updated AWS KMS transaction signing fields
- 4f2c50f: Added support for login with custom auth endpoint

## 3.2.1

### Patch Changes

- 074405b: Moved cartridgeTag to analyticsOptions

## 3.2.0

### Minor Changes

- b58ec0b: Migrated account signature generation to use AWS KMS

## 3.1.0

### Minor Changes

- 399d230: Added support for analytics

## 3.0.0

### Major Changes

- d468a1b: Migrated from in-app wallets to ecosystem wallets

## 2.7.1

## 2.7.0

### Minor Changes

- 01c4c35: Updated user sessions to be fetched through Thirdweb SDK

### Patch Changes

- 750b98e: Fixed file name for CommonJS package exports
- 3d01c9a: Skip extra user session fetch on login

## 2.6.1

### Patch Changes

- 291e636: Allow string type for values when sending raw transactions

## 2.6.0

### Minor Changes

- d9afa84: Updated TDK API client wait for transaction completion behavior

### Patch Changes

- 28cfa6b: Added X connect method option
- 947e37c: Added utility for signing account signature message as backend wallet

## 2.5.0

### Minor Changes

- df6d965: Added update user to TDK API client

### Patch Changes

- 65d384f: Updated Magicswap router ABI and addresses

## 2.4.0

### Minor Changes

- db210bc: Added get user transactions helper to TDK API client

## 2.3.0

### Minor Changes

- 0608a3d: Refactored send native TDK API function to send any raw transaction

## 2.2.4

### Patch Changes

- 83aab09: Added txOverrides option for creating transactions through TDK API client

## 2.2.3

### Patch Changes

- f42c891: Fixes the implementation of isSocialConnectMethod
- b75e4c8: Added connect with passkey param to override sign in type
- 0137720: Removed deprecated `createLoginUrl` helper

## 2.2.2

### Patch Changes

- 34cfc5c: Fix passkey when using redirect for social

## 2.2.0

### Minor Changes

- 61ec250: Reduced dependencies on wagmi/viem
  Removed exports of supported chains and other undocumented utilities

### Patch Changes

- d110c16: Added new redirect support

## 2.0.0

### Major Changes

- e4dd9d7: Updated Treasure Connect flow to use custom modal

## 1.6.0

### Minor Changes

- 9d7bb39: Allow authentication via redirect. Update thirdweb sdk to latest and remove old param authenticatorType from passkey auth
- 6e391d7: fix add liquidity for erc20-nft

## 1.5.0

### Minor Changes

- f4ff171: Removed payments module hooks, utils and components

### Patch Changes

- 9e56447: Added strict typing on Magicswap argument utils

## 1.4.0

### Minor Changes

- 72d45e9: add remove liquidity helpers and API endpoint
- ea0053b: add eth based swap support
- ac072df: add magicswap liquidity api helpers

### Patch Changes

- 361c861: Added telegram to social login options

## 1.3.0

### Minor Changes

- af94875: add magicswap method to get arguments to add liquidity
- f272eb2: Renamed user smartAccountAddress field to address

## 1.2.0

### Minor Changes

- eeb81b0: Added magicswap helpers to tdk api client
- 1ab9e76: Added helpers for login with phone number and passkey
- 1ab9e76: Added Discord login option

## 1.1.0

### Minor Changes

- cffb8e3: Added Treasure Connect login functions to core package

### Patch Changes

- fea2894: Added Magicswap utils

## 1.0.0

### Major Changes

- 5fa7564: Updated primary login method to connect modal flow

## 0.2.8

### Patch Changes

- fd71069: Fixed Zee userCharacterMaxBoost value

## 0.2.7

### Patch Changes

- 786c1c7: Added Zeeverse Game testnet contract address
- 64d48ee: Exported API response types
- 2bd76e8: Removed unused files and exports

## 0.2.6

### Patch Changes

- c5dc87b: Added Treasure Ruby chain configuration data
- 59caa63: Added Ethereum mainnet Zeeverse contracts

## 0.2.5

### Patch Changes

- 14b01be: added option to pass custom wagmi configs for contract calls
