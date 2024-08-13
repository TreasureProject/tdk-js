import { ThirdwebTextIcon } from "../../icons/ThirdwebTextIcon";

export const ConnectFooter = () => {
  return (
    <a
      href="https://thirdweb.com/connect?utm_source=cw_text"
      target="_blank"
      rel="noopener noreferrer"
      className="tdk-flex tdk-items-center tdk-justify-center tdk-gap-1 tdk-text-[#9DA3AB] tdk-font-semibold hover:tdk-text-white tdk-transition-colors tdk-text-xs tdk-no-underline"
    >
      Powered by <ThirdwebTextIcon height={13} />
    </a>
  );
};
