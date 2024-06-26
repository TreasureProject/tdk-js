import { jwtDecode } from "jwt-decode";

export const decodeAuthToken = (token: string) =>
  jwtDecode<{
    sub: string;
    exp: number;
    ctx: {
      id: string;
      email: string;
    };
  }>(token);
