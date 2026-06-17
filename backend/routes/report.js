import { Router } from "express";
import { generateWeeklyReport, getReports, getWeekReport } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.post("/generate/:planId/:weekNumber", generateWeeklyReport)
router.get("/:planId",             getReports);
router.get("/:planId/:weekNumber", getWeekReport);
export default router;