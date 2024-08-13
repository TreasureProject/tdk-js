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
    <div className="tdk-bg-night-1100 tdk-p-8 tdk-font-sans tdk-space-y-6">
      <div className="tdk-space-y-2">
        <h2 className="tdk-text-lg tdk-font-semibold tdk-text-white">
          Verify code
        </h2>
        <p className="tdk-text-sm tdk-text-[#9DA3AB]">
          We have sent a verification code to{" "}
          <span className="tdk-text-night-200 tdk-font-medium">
            {recipient}
          </span>
          . You will be automatically logged in after entering your code.
        </p>
      </div>
      <div className="tdk-h-[1px] tdk-bg-night-900" />
      <div className="tdk-space-y-6">
        <div>
          <h3 className="tdk-text-sm tdk-font-normal tdk-text-night-200">
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
                "tdk-rounded tdk-text-lg tdk-font-semibold tdk-flex tdk-items-center tdk-justify-center tdk-bg-[#071422] tdk-border tdk-border-[#10263E] tdk-text-[#FFFCF3]",
              characterInactive: "tdk-bg-[#071422]",
              characterSelected:
                "tdk-border-night-300 tdk-outline-night-300 tdk-text-[#FFFCF3]",
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
          <p className="tdk-text-[#6E747F] tdk-text-sm tdk-text-center">
            Didn't get a code?{" "}
            <button
              type="button"
              className="tdk-text-[#E7E8E9] hover:tdk-underline tdk-bg-transparent tdk-border-none tdk-p-0 tdk-cursor-pointer"
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
