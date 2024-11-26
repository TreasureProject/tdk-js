import {
  type CreateThirdwebClientOptions,
  createThirdwebClient,
} from "thirdweb";

import { DEFAULT_TDK_API_BASE_URI } from "./constants";
import { createApiClient } from "./utils/api";

export const createTreasureClient = ({
  apiUri = DEFAULT_TDK_API_BASE_URI,
  authToken,
  ...thirdwebClientOptions
}: CreateThirdwebClientOptions & {
  apiUri?: string;
  authToken?: string;
}) => ({
  ...createThirdwebClient(thirdwebClientOptions),
  api: createApiClient({ baseUri: apiUri, authToken }),
});

export type TreasureClient = ReturnType<typeof createTreasureClient>;
