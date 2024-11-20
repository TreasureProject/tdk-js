import type { Meta, StoryObj } from "@storybook/react";

import { ConnectButtonAuthenticatedView } from "./ConnectButtonAuthenticatedView";

const meta: Meta<typeof ConnectButtonAuthenticatedView> = {
  component: ConnectButtonAuthenticatedView,
};

export default meta;
type Story = StoryObj<typeof ConnectButtonAuthenticatedView>;

export const Default: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
  },
};

export const WithProfilePic: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
    pfp: "https://djmahssgw62sw.cloudfront.net/general/0xb8e0d594cd869e49ae55c5b44fa886857b1cdeb9d4aeb49b44d47eeccf97c835.png",
  },
};

export const WithTag: Story = {
  args: {
    address: "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
    tag: "rappzula",
    pfp: "https://djmahssgw62sw.cloudfront.net/general/0xb8e0d594cd869e49ae55c5b44fa886857b1cdeb9d4aeb49b44d47eeccf97c835.png",
  },
};
