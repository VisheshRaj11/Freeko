import { Router } from "express";
import { protect } from "../middleware/auth.js";
import AthleteProfile from "../models/AthleteProfile.js";

const router = Router();
router.use(protect);

router.get('/:userId', async(req, res) => {
    const p = await AthleteProfile.findOne({userId: req.params.userId})
    .populate("userId", "name email");

    if(!p) return res.status(404).json({message: "Not found"});
    res.json(p);
})

router.patch('/:userId', async( req, res) => {
    const p = await findOneAndUpdate({userId: req.params.userId}, req.body, {new: true});
    res.json(p);
})

export default router;