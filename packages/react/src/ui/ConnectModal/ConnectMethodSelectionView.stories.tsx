import type { Meta, StoryObj } from "@storybook/react";

import { ConnectMethodSelectionView } from "./ConnectMethodSelectionView";

const meta: Meta<typeof ConnectMethodSelectionView> = {
  component: ConnectMethodSelectionView,
};

export default meta;
type Story = StoryObj<typeof ConnectMethodSelectionView>;

export const Default: Story = {
  args: {
    appName: "Treasure",
    onConnect: (method, email) => console.log({ method, email }),
  },
};
