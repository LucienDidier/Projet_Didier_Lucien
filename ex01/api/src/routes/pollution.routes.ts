import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";
import pollutionReportsController from "../controllers/pollution-reports.controllers";

export default (app: Application): void => {
  const legacyRouter = Router();

  legacyRouter.get("/", pollutionController.getAll);
  legacyRouter.get("/:id", pollutionController.getById);

  const reportsRouter = Router();
  reportsRouter.get("/", pollutionReportsController.getAll);
  reportsRouter.get("/:id", pollutionReportsController.getById);
  reportsRouter.post("/", pollutionReportsController.create);
  reportsRouter.put("/:id", pollutionReportsController.update);
  reportsRouter.delete("/:id", pollutionReportsController.remove);

  app.use("/api/pollutions", reportsRouter);
  app.use("/api/pollution", legacyRouter);
};
