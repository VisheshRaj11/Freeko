import { Router } from "express";
import { getReports, getWeekReport } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/:planId",             getReports);
router.get("/:planId/:weekNumber", getWeekReport);
export default router;