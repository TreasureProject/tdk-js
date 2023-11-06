import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";

import { withChain } from "./middleware/chain";
import { withCors } from "./middleware/cors";
import { withErrorHandler } from "./middleware/error";
import { withJwt } from "./middleware/jwt";
import { withProject } from "./middleware/project";
import { withSwagger } from "./middleware/swagger";
import { loginRoutes } from "./routes/login";
import { projectsRoutes } from "./routes/projects";
import { env } from "./utils/env";

const main = async () => {
  const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  // Middleware
  await withCors(app);
  await withErrorHandler(app);
  await withJwt(app);
  await withSwagger(app);
  await withChain(app);
  await withProject(app);

  // Routes
  await Promise.all([app.register(projectsRoutes), app.register(loginRoutes)]);

  // Start server
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
