import type { Meta, StoryObj } from "@storybook/react";

import { ConnectMigrateUserView } from "./ConnectMigrateUserView";

const meta: Meta<typeof ConnectMigrateUserView> = {
  component: ConnectMigrateUserView,
};

export default meta;
type Story = StoryObj<typeof ConnectMigrateUserView>;

export const Default: Story = {
  args: {
    legacyProfiles: [
      {
        id: "test-legacyProfile-1",
        tag: "rappzula",
        discriminant: 1337,
        pfp: "https://djmahssgw62sw.cloudfront.net/general/0xb8e0d594cd869e49ae55c5b44fa886857b1cdeb9d4aeb49b44d47eeccf97c835.png",
        banner:
          "https://djmahssgw62sw.cloudfront.net/general/0x19a59e64df51da1aad93ee9d0c4ec00412c0de13b2401be65ee775714f786dd4.jpg",
      },
      {
        id: "test-legacyProfile-2",
        tag: "rappzula",
        discriminant: 0,
        pfp: null,
        banner: null,
      },
    ],
  },
};
