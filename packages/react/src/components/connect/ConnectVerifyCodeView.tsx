import { useState } from "react";
import VerificationInput from "react-verification-input";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { ConnectFooter } from "./ConnectFooter";

type Props = {
  recipient: string;
  isConnecting?: boolean;
  onConnect: (code: string) => void;
  onResend: () => void;
};

export const ConnectVerifyCodeView = ({
  recipient,
  isConnecting = false,
  onConnect,
  onResend,
}: Props) => {
  const [code, setCode] = useState("");
  return (
    <div className="tdk-bg-night tdk-p-8 tdk-font-sans tdk-space-y-6">
      <div className="tdk-space-y-2">
        <h2 className="tdk-text-lg tdk-font-semibold tdk-text-white">
          Verify code
        </h2>
        <p className="tdk-text-sm tdk-text-silver">
          We have sent a verification code to{" "}
          <span className="tdk-text-silver-200 tdk-font-medium">
            {recipient}
          </span>
          . You will be automatically logged in after entering your code.
        </p>
      </div>
      <div className="tdk-h-[1px] tdk-bg-silver-500" />
      <div className="tdk-space-y-6">
        <div>
          <h3 className="tdk-text-sm tdk-font-normal tdk-text-silver-200">
            Enter verification code:
          </h3>
          <VerificationInput
            length={6}
            placeholder=""
            autoFocus
            onChange={setCode}
            onComplete={onConnect}
            classNames={{
              character:
                "tdk-rounded tdk-text-lg tdk-font-semibold tdk-flex tdk-items-center tdk-justify-center tdk-bg-[#0C1420] tdk-border tdk-border-night-500 tdk-text-cream",
              characterInactive: "tdk-bg-[#0C1420]",
              characterSelected:
                "tdk-border-silver-300 tdk-outline-silver-300 tdk-text-cream",
            }}
          />
        </div>
        <div className="tdk-space-y-3">
          <Button
            className="tdk-w-full tdk-font-medium"
            onClick={() => onConnect(code)}
          >
            {isConnecting ? (
              <Spinner className="tdk-w-3.5 tdk-h-3.5" />
            ) : (
              "Connect"
            )}
          </Button>
          <p className="tdk-text-silver-600 tdk-text-sm tdk-text-center">
            Didn't get a code?{" "}
            <button
              type="button"
              className="tdk-text-silver-100 hover:tdk-underline tdk-bg-transparent tdk-border-none tdk-p-0 tdk-cursor-pointer"
              onClick={onResend}
            >
              Resend
            </button>
          </p>
        </div>
      </div>
      <ConnectFooter />
    </div>
  );
};
