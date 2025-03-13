import { Router } from "express";
import { createReport, getRecentReports, updateReport} from "../controllers/ReportControllers.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { getReports } from "../controllers/UserController.js";
import { getDBConnection } from "../db/dbConfig.js";

const reportRouter = Router();

reportRouter.use(async (req, res, next) => {
  await getDBConnection();
  next();
});

reportRouter.post("/create-report",verifyToken, createReport );
reportRouter.get("/get-recent-report",verifyToken, getReports );
reportRouter.get("/get-reports",verifyToken, getRecentReports );
reportRouter.patch("/update-report",verifyToken, updateReport );

export default reportRouter;