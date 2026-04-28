import { Router } from "express";
import { protect } from "../middleware/auth.js";
import WorkoutSession from "../models/WorkoutSession.js";

const router = Router();
router.use(protect);

router.get('/athlete/:atheleId', async(req, res) => {
    try {
        const flagged = await WorkoutSession.find({
            athleteId: req.params.atheleId,
            "aiAnomalyReport.detected": true,
        }).sort("-loggedAt");
         res.json(flagged);
    } catch (error) {
         res.status(500).json({ message: err.message });
    }
})

export default router;