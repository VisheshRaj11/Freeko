import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import CoachProfile from "../models/CoachProfile.js";
import AthleteProfile from "../models/AthleteProfile.js";
import { cached, invalidate, TTL } from "../utils/cache.js";

const router = Router();
router.use(protect);

router.get("/:userId", async (req, res) => {
  const p = await CoachProfile.findOne({ userId: req.params.userId })
    .populate("userId", "name email");
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

router.patch("/:userId", requireRole("coach"), async (req, res) => {
  const p = await CoachProfile.findOneAndUpdate(
    { userId: req.params.userId }, req.body, { new: true }
  );
  res.json(p);
});

router.get("/:coachId/athletes", requireRole("coach"), async (req, res) => {
  try {
       const coachId = req.params.coachId
       const cacheKey = `coach:${coachId}:athletes`
        console.log(cacheKey)
       const athletes = await cached(cacheKey, TTL.SHORT, async() => {
          return await AthleteProfile.find({ assignedCoachId: req.params.coachId })
                .populate("userId", "name email avatarUrl");
       })

       res.json(athletes);
  } catch (error) {
      res.status(500).json({ message: err.message })
  }
  // const athletes = await AthleteProfile.find({ assignedCoachId: req.params.coachId })
  //   .populate("userId", "name email avatarUrl");
});


export const invalidateCoachAthletes = async (coachId) => {
  await invalidate(`coach:${coachId}:athletes`)
}

export default router;