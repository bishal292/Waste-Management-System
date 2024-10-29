import { Router } from "express";
import { createReport, getRecentReports} from "../controllers/ReportControllers.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const reportRouter = Router();

reportRouter.post ("/create-report",verifyToken, createReport );
reportRouter.get ("/get-recent-report",verifyToken, getRecentReports );


export default reportRouter;