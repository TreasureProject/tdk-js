import type { IconProps } from "./types";

export const CloseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 20 20" className={className}>
    <g id="close">
      <path
        id="Vector"
        d="M14.375 5.625L5.625 14.375"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        id="Vector_2"
        d="M5.625 5.625L14.375 14.375"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
);
