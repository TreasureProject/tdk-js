import type { Meta, StoryObj } from "@storybook/react";

import { ConnectVerifyCodeView } from "./ConnectVerifyCodeView";

const meta: Meta<typeof ConnectVerifyCodeView> = {
  component: ConnectVerifyCodeView,
};

export default meta;
type Story = StoryObj<typeof ConnectVerifyCodeView>;

export const Default: Story = {
  args: {
    recipient: "example@treasure.lol",
    onConnect: (code) => console.log({ code }),
    onResend: () => console.log("Resend"),
  },
};
