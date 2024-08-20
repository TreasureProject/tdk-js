import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "../ui/Button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/InputOTP";
import { ConnectFooter } from "./ConnectFooter";

type Props = {
  recipient: string;
  isLoading?: boolean;
  error?: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
};

const OTP_CODE_LENGTH = 6;

export const ConnectVerifyCodeView = ({
  recipient,
  isLoading = false,
  error,
  onConfirm,
  onResend,
}: Props) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const resendInterval = useRef<NodeJS.Timeout | null>(null);
  const [resendAvailableInSec, setResendAvailableInSec] = useState(0);

  const handleResend = () => {
    onResend();

    if (resendInterval.current) {
      clearInterval(resendInterval.current);
    }

    setResendAvailableInSec(15);
    resendInterval.current = setInterval(() => {
      setResendAvailableInSec((curr) => {
        if (curr === 1 && resendInterval.current) {
          clearInterval(resendInterval.current);
        }

        return curr - 1;
      });
    }, 1_000);
  };

  return (
    <div className="tdk-bg-night tdk-p-8 tdk-font-sans tdk-space-y-6">
      <div className="tdk-space-y-2">
        {/* biome-ignore lint/a11y/useHeadingContent: screen reader title is in ConnectModal */}
        <h2
          className="tdk-text-lg tdk-font-semibold tdk-text-white tdk-m-0"
          aria-hidden="true"
        >
          {t("connect.verify.header")}
        </h2>
        <p className="tdk-text-sm tdk-text-silver">
          <Trans i18nKey="connect.verify.description" values={{ recipient }}>
            We have sent a verification code to{" "}
            <span className="tdk-text-silver-200 tdk-font-medium">
              {recipient}
            </span>
            . You will be automatically logged in after entering your code.
          </Trans>
        </p>
      </div>
      <div className="tdk-h-[1px] tdk-bg-night-500" />
      {error ? (
        <p className="tdk-bg-ruby-200 tdk-border tdk-border-ruby-800 tdk-text-ruby-800 tdk-px-3 tdk-py-2 tdk-rounded-md">
          {error}
        </p>
      ) : null}
      <div className="tdk-space-y-6">
        <div>
          <h3 className="tdk-text-sm tdk-font-normal tdk-text-silver-200 tdk-mt-0 tdk-mb-2">
            {t("connect.verify.inputLabel")}
          </h3>
          <InputOTP
            maxLength={OTP_CODE_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            value={code}
            onChange={(nextCode) => {
              setCode(nextCode);
              if (nextCode.length === OTP_CODE_LENGTH) {
                onConfirm(nextCode);
              }
            }}
            autoComplete="off"
            disabled={isLoading}
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_CODE_LENGTH }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: index is the only key
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="tdk-space-y-3">
          <Button
            className="tdk-w-full tdk-font-medium"
            isLoading={isLoading}
            onClick={() => onConfirm(code)}
          >
            {t("connect.verify.action")}
          </Button>
          <p className="tdk-text-silver-600 tdk-text-sm tdk-text-center">
            {t("connect.verify.resend.prompt")}{" "}
            {resendAvailableInSec > 0 ? (
              <span className="tdk-text-silver-100">
                {t("connect.verify.resend.countdown", { resendAvailableInSec })}
              </span>
            ) : (
              <button
                type="button"
                className="tdk-text-silver-100 hover:tdk-underline tdk-bg-transparent tdk-border-none tdk-p-0 tdk-cursor-pointer"
                onClick={handleResend}
              >
                {t("connect.verify.resend.action")}
              </button>
            )}
          </p>
        </div>
      </div>
      <ConnectFooter />
    </div>
  );
};
