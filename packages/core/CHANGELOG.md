# @treasure-dev/tdk-core

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

## 2.2.1

## 2.2.0

### Minor Changes

- 61ec250: Reduced dependencies on wagmi/viem
  Removed exports of supported chains and other undocumented utilities

### Patch Changes

- d110c16: Added new redirect support

## 2.1.0

## 2.0.1

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

## 1.4.1

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

## 1.0.1

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
