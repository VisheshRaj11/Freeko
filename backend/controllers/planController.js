import axios from "axios";
import MasterPlan    from "../models/MasterPlan.js";
import Mesocycle     from "../models/Mesocycle.js";
import Microcycle    from "../models/Microcycle.js";
import WorkoutSession from "../models/WorkoutSession.js";
import AthleteProfile from "../models/AthleteProfile.js";
import mongoose from "mongoose";
import { pl } from "zod/v4/locales";

const AI = process.env.AI_SERVICE_URL;


// Add this helper function at the top of planController.js
const sanitizeIntensity = (level) => {
  if (!level) return "moderate"
  const l = level.toLowerCase()
  if (l.includes("peak"))     return "peak"
  if (l.includes("high"))     return "high"
  if (l.includes("low"))      return "low"
  if (l.includes("moderate")) return "moderate"
  return "moderate" // safe default
}

export const generatePlan = async (req, res) => {
  const { athleteId, title, startDate, totalWeeks } = req.body;
  console.log(req.body);
  try {
    const profile = await AthleteProfile.findOne({ _id: athleteId });
    // console.log(profile);
    if (!profile) return res.status(404).json({ message: "Athlete not found" });
    // console.log("Ai responed")
    console.log(AI);
    const { data } = await axios.post(`${AI}/generate-plan`, {
      athlete: {
        fitnessLevel:    profile.fitnessLevel,
        goals:           profile.goals,
        weaknesses:      profile.weaknesses,
        competitionDate: profile.competitionDate,
        weight:          profile.weight,
        height:          profile.height,
      },
      totalWeeks,
      startDate,
    });

    // console.log(data);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalWeeks * 7);

    const plan = await MasterPlan.create({
      coachId: req.user._id, athleteId, title,
      totalWeeks, startDate, endDate, status: "active",
      aiMetadata: { model: "gemini-2.5-flash", generatedAt: new Date() },
    });

    // for (const meso of data.mesocycles) {
    //   const mesoDoc = await Mesocycle.create({
    //     masterPlanId: plan._id, name: meso.name,
    //     focus: meso.focus, weekStart: meso.week_start,
    //     weekEnd: meso.week_end, totalWeeks: meso.total_weeks,
    //     intensityLevel: sanitizeIntensity(meso.intensity_level), order: meso.order,
    //   });

    //   for (const micro of meso.microcycles) {
    //     const microDoc = await Microcycle.create({
    //       mesocycleId: mesoDoc._id, weekNumber: micro.week_number,
    //       isDeload: micro.is_deload, theme: micro.theme,
    //       volumeTargets: micro.volume_targets,
    //     });

    //     for (const session of micro.sessions) {
    //       await WorkoutSession.create({
    //         microcycleId: microDoc._id, athleteId,
    //         dayLabel: session.day_label, status: "planned",
    //         exercises: session.exercises,
    //       });
    //     }
    //   }
    // }
    
        const mesoInserts = data.mesocycles.map((meso, idx) => ({
      masterPlanId:   plan._id,
      name:           meso.name,
      focus:          meso.focus,
      weekStart:      meso.week_start,
      weekEnd:        meso.week_end,
      totalWeeks:     meso.total_weeks,
      intensityLevel: sanitizeIntensity(meso.intensity_level),
      order:          meso.order || idx + 1,
    }))

    const mesoDocs = await Mesocycle.insertMany(mesoInserts)

    // Create all microcycles at once
    const microInserts = []
    data.mesocycles.forEach((meso, i) => {
      meso.microcycles?.forEach((micro) => {
        microInserts.push({
          mesocycleId:   mesoDocs[i]._id,
          weekNumber:    micro.week_number,
          isDeload:      micro.is_deload,
          theme:         micro.theme,
          volumeTargets: micro.volume_targets,
        })
      })
    })

    const microDocs = await Microcycle.insertMany(microInserts)

    // Create all sessions at once
    const sessionInserts = []
    let microIdx = 0
    data.mesocycles.forEach((meso) => {
      meso.microcycles?.forEach((micro) => {
        micro.sessions?.forEach((session) => {
          sessionInserts.push({
            microcycleId: microDocs[microIdx]._id,
            athleteId,
            dayLabel:     session.day_label,
            status:       "planned",
            exercises:    session.exercises,
          })
        })
        microIdx++
      })
    })

    await WorkoutSession.insertMany(sessionInserts)

    res.status(201).json({ message: "Plan generated", planId: plan._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMicroPlans = async(req, res) => {
  console.log(req.params);
  const {coachId, athleteId} = req.params;
  // coachId = new mongoose.Types
  if(!coachId) return res.json("coach and athlete are mandatory");
  try {
    const data = await MasterPlan.find({coachId});
    // console.log(data);
    return res.json({plan: data});
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}

export const getPlan = async (req, res) => {
  // console.log(req.params);
  try {
    const plan = await MasterPlan.findById(req.params.planId)
      .populate("coachId", "name email")
      .populate("athleteId", "name email");

    console.log(plan);

    if (!plan) return res.status(404).json({ message: "Not found" });

    const mesocycles = await Mesocycle.find({ masterPlanId: plan._id }).sort("order");
    const result = [];

    for (const meso of mesocycles) {
      const microcycles = await Microcycle.find({ mesocycleId: meso._id }).sort("weekNumber");
      const mesoObj = meso.toObject();
      mesoObj.microcycles = [];
      for (const micro of microcycles) {
        const sessions  = await WorkoutSession.find({ microcycleId: micro._id });
        const microObj  = micro.toObject();
        microObj.sessions = sessions;
        mesoObj.microcycles.push(microObj);
      }
      result.push(mesoObj);
    }

    res.json({ plan, mesocycles: result });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getAthletePlans = async (req, res) => {
  try {
    // console.log(req.params)
    const plans = await MasterPlan.find({ athleteId: req.params.athleteId })
      .populate("coachId", "name email").sort("-createdAt");
      console.log(plans)
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePlanStatus = async (req, res) => {
  try {
    const plan = await MasterPlan.findByIdAndUpdate(
      req.params.planId, { status: req.body.status }, { new: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};