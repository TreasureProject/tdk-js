import { getContractAddress, treasureTopaz } from "@treasure-dev/tdk-core";

export const TOPAZ_NFT_ADDRESS = getContractAddress(
  treasureTopaz.id,
  "TopazNFT",
);

export const TREASURY_ADDRESS = "0xE647b2c46365741e85268ceD243113d08F7E00B8";
