import { Router } from "express";
import { generatePlan, getPlan, getMicroPlans, getAthletePlans, updatePlanStatus, } from "../controllers/planController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.post("/generate", requireRole("coach"), generatePlan);
router.get('/get-microPlans/:coachId/:athleteId', requireRole('coach'), getMicroPlans);
router.get("/:planId", getPlan);
router.get("/athlete/:athleteId", getAthletePlans);
router.patch("/:planId/status", requireRole("coach"), updatePlanStatus);
export default router;