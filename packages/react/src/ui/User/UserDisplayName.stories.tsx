import type { Meta, StoryObj } from "@storybook/react";

import { UserDisplayName } from "./UserDisplayName";

const meta: Meta<typeof UserDisplayName> = {
  component: UserDisplayName,
};

export default meta;
type Story = StoryObj<typeof UserDisplayName>;

export const Default: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
    className: "tdk-bg-black tdk-p-2",
  },
};

export const WithTag: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
    tag: "rappzula",
    className: "tdk-bg-black tdk-p-2",
  },
};
