import { Application, Router } from "express";
import usersController from "../controllers/users.controllers";

export default (app: Application): void => {
  const router = Router();

  router.get("/", usersController.getAll);
  router.post("/", usersController.create);

  app.use("/api/users", router);
};
