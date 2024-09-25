import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_TDK_CLIENT_ID;

export const client = createThirdwebClient({
  clientId: clientId,
});
