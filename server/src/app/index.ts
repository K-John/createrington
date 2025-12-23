import express, { type Express } from "express";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware";

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
