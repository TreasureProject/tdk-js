import type { Meta, StoryObj } from "@storybook/react";
import type { User } from "@treasure-dev/tdk-core";

import { ConnectButtonAuthenticatedView } from "./ConnectButtonAuthenticatedView";

const meta: Meta<typeof ConnectButtonAuthenticatedView> = {
  component: ConnectButtonAuthenticatedView,
};

export default meta;
type Story = StoryObj<typeof ConnectButtonAuthenticatedView>;

export const Default: Story = {
  args: {
    user: {
      address: "0x0000000000000000000000000000000000000000",
    } as User,
  },
};
