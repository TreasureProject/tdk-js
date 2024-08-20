import { Trans } from "react-i18next";
import { ThirdwebTextIcon } from "../../icons/ThirdwebTextIcon";

export const ConnectFooter = () => {
  return (
    <div className="tdk-flex tdk-items-center tdk-justify-center">
      <a
        href="https://thirdweb.com/connect?utm_source=cw_text"
        target="_blank"
        rel="noopener noreferrer"
        className="tdk-inline-flex tdk-items-center tdk-gap-1 tdk-text-silver tdk-font-semibold hover:tdk-text-white tdk-transition-colors tdk-text-xs tdk-no-underline hover:tdk-no-underline"
      >
        <Trans
          i18nKey="connect.footer"
          components={{
            ThirdwebTextIcon: <ThirdwebTextIcon height={13} />,
          }}
        />
      </a>
    </div>
  );
};
