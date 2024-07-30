import { jwtDecode } from "jwt-decode";
import type { User } from "../types";

export const decodeAuthToken = (token: string) =>
  jwtDecode<{
    sub: string;
    exp: number;
    ctx: Omit<User, "allActiveSigners">;
  }>(token);
