import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";

import { loginRoutes } from "./routes/login";
import { projectsRoutes } from "./routes/projects";
import { env } from "./utils/env";

const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

app.register(projectsRoutes);
app.register(loginRoutes);

app.setErrorHandler((err, request, reply) => {
  reply.code(err.statusCode ?? 500).send({ error: err.message });
});

app.listen({ port: env.PORT }, (err, address) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
