import { Application } from "express";
import authRoutes from "./auth.routes";
import pollutionRoutes from "./pollution.routes";
import usersRoutes from "./users.routes";

export default (app: Application): void => {
  authRoutes(app);
  pollutionRoutes(app);
  usersRoutes(app);
};
