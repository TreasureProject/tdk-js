import type { ClassValue } from "clsx";
import clsx from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  prefix: "tdk-",
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
