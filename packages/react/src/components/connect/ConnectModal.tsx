import { ConnectMethodView } from "./ConnectMethodView";

type Props = {
  appName: string;
  appIconUri?: string;
};

export const ConnectModal = ({ appName, appIconUri }: Props) => {
  return (
    <div className="tdk-rounded-lg">
      <ConnectMethodView
        appName={appName}
        appIconUri={appIconUri}
        onConnect={() => {}}
      />
    </div>
  );
};
