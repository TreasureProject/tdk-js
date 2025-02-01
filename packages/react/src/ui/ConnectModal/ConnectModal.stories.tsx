import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { ConnectModal } from "./ConnectModal";

const meta: Meta<typeof ConnectModal> = {
  component: ConnectModal,
};

export default meta;
type Story = StoryObj<typeof ConnectModal>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open Connect Modal
        </button>
        <ConnectModal {...args} open={open} onOpenChange={setOpen} />
      </>
    );
  },
};
