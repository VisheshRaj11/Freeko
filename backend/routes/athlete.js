import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import AthleteProfile from "../models/AthleteProfile.js";

const router = Router();
router.use(protect);

router.get('/unassigned',async(req, res) => {
    try {
        const athletes = await AthleteProfile.find({assignedCoachId: null}).populate('userId');
        if(!athletes.length === 0) return res.status(404).json({message: "No athletes found"});
        // console.log(athletes);
        return res.status(200).json({athletes});
    } catch (error) {
         return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
})

router.get('/:userId', async(req, res) => {
    console.log(req.params);
    const p = await AthleteProfile.findOne({userId: req.params.userId})
    .populate("userId", "name email");

    if(!p) return res.status(404).json({message: "Not found"});
    res.json(p);
})

router.patch('/:userId', async( req, res) => {
    const p = await AthleteProfile.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true});
    console.log(p);
    res.json(p);
})


export default router;