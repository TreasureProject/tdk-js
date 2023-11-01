import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";

import { withErrorHandler } from "./middleware/error";
import { withOpenApi } from "./middleware/open-api";
import { withRoutes } from "./middleware/routes";
import { env } from "./utils/env";

const main = async () => {
  const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  await withErrorHandler(app);
  await withOpenApi(app);
  await withRoutes(app);
  await app.ready();

  app.listen({ port: env.PORT }, (err, address) => {
    if (err) {
      console.error("Error starting server:", err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  });
};

main();
