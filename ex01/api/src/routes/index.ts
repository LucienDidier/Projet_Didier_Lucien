import { Application } from "express";
import pollutionRoutes from "./pollution.routes";
import usersRoutes from "./users.routes";

export default (app: Application): void => {
  pollutionRoutes(app);
  usersRoutes(app);
};
