import type { Meta, StoryObj } from "@storybook/react";

import { ConnectMethodView } from "./ConnectMethodView";

const meta: Meta<typeof ConnectMethodView> = {
  component: ConnectMethodView,
};

export default meta;
type Story = StoryObj<typeof ConnectMethodView>;

export const Primary: Story = {
  args: {
    appName: "Treasure",
  },
};
