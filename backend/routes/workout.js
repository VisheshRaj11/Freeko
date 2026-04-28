import { Router } from "express";
import { logWorkout, getSession, getAthleteSessions, skipSession } from "../controllers/workoutController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.post('/:sessionId/log', logWorkout);
router.get("/session/:sessionId", getSession);
router.get('/athlete/:athleteId', getAthleteSessions);
router.patch("/:sessionId/skip",  skipSession);
export default router;