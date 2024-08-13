import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { ConnectModal } from "./ConnectModal";

const meta: Meta<typeof ConnectModal> = {
  component: ConnectModal,
};

export default meta;
type Story = StoryObj<typeof ConnectModal>;

const ConnectPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Connect Modal
      </button>
      <ConnectModal open={open} appName="ConnectModal Story" />
    </>
  );
};

export const Primary: Story = {
  render: () => (
    <ThirdwebProvider>
      <ConnectPage />
    </ThirdwebProvider>
  ),
};
