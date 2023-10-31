import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";

import { projectsRoutes } from "./routes/projects";

const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

app.register(projectsRoutes);

app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
