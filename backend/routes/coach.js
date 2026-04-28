import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import CoachProfile from "../models/CoachProfile.js";
import AthleteProfile from "../models/AthleteProfile.js";

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
  const athletes = await AthleteProfile.find({ assignedCoachId: req.params.coachId })
    .populate("userId", "name email avatarUrl");
  res.json(athletes);
});

export default router;