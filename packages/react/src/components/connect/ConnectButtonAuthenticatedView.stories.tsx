import type { Meta, StoryObj } from "@storybook/react";

import { ConnectButtonAuthenticatedView } from "./ConnectButtonAuthenticatedView";

const meta: Meta<typeof ConnectButtonAuthenticatedView> = {
  component: ConnectButtonAuthenticatedView,
};

export default meta;
type Story = StoryObj<typeof ConnectButtonAuthenticatedView>;

export const Default: Story = {
  args: {
    userAddress: "0x1234000000000000000000000000000000005678",
  },
};
