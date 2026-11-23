import { Application, Router } from "express";
import usersController from "../controllers/users.controllers";
import authenticate from "../middleware/auth.middleware";

export default (app: Application): void => {
  const router = Router();

  router.get("/", authenticate, usersController.getAll);
  router.post("/", usersController.create);

  app.use("/api/users", router);
};
