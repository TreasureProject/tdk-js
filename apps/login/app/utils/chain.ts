import { TREASURE_RUBY_CHAIN_DEFINITION } from "@treasure-dev/tdk-react";
import {
  arbitrum,
  arbitrumSepolia,
  defineChain,
  mainnet,
  sepolia,
} from "thirdweb/chains";

export const CHAIN_ID_TO_CHAIN_MAPPING = {
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [TREASURE_RUBY_CHAIN_DEFINITION.id]: defineChain(
    TREASURE_RUBY_CHAIN_DEFINITION,
  ),
};
