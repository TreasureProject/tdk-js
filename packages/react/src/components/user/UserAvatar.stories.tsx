import type { Meta, StoryObj } from "@storybook/react";

import { UserAvatar } from "./UserAvatar";

const meta: Meta<typeof UserAvatar> = {
  component: UserAvatar,
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
    className: "tdk-w-6 tdk-h-6 tdk-rounded-lg",
  },
};

export const WithPfp: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
    pfp: "https://djmahssgw62sw.cloudfront.net/general/0xb8e0d594cd869e49ae55c5b44fa886857b1cdeb9d4aeb49b44d47eeccf97c835.png",
    className: "tdk-w-6 tdk-h-6 tdk-rounded-lg",
  },
};
