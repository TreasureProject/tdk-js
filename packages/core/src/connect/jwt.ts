import { jwtDecode } from "jwt-decode";
import type { UserContext } from "../types";

export const decodeAuthToken = (token: string) =>
  jwtDecode<{
    sub: string;
    exp: number;
    ctx: UserContext;
  }>(token);
