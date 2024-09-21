import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";

import { log } from "./log";

export const app = Fastify({
  loggerInstance: process.env.NODE_ENV === "development" ? log : undefined,
}).withTypeProvider<TypeBoxTypeProvider>();

export type App = typeof app;
