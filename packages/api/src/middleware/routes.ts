import type { FastifyInstance } from "fastify";

import { loginRoutes } from "../routes/login";
import { projectsRoutes } from "../routes/projects";

export const withRoutes = async (app: FastifyInstance) =>
  Promise.all([app.register(projectsRoutes), app.register(loginRoutes)]);
