import axios from "axios";
import MasterPlan    from "../models/MasterPlan.js";
import Mesocycle     from "../models/Mesocycle.js";
import Microcycle    from "../models/Microcycle.js";
import WorkoutSession from "../models/WorkoutSession.js";
import AthleteProfile from "../models/AthleteProfile.js";

const AI = process.env.AI_SERVICE_URL;

export const generatePlan = async (req, res) => {
  const { athleteId, title, startDate, totalWeeks } = req.body;
  try {
    const profile = await AthleteProfile.findOne({ userId: athleteId });
    if (!profile) return res.status(404).json({ message: "Athlete not found" });

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

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalWeeks * 7);

    const plan = await MasterPlan.create({
      coachId: req.user._id, athleteId, title,
      totalWeeks, startDate, endDate, status: "active",
      aiMetadata: { model: "gemini-2.5-flash", generatedAt: new Date() },
    });

    for (const meso of data.mesocycles) {
      const mesoDoc = await Mesocycle.create({
        masterPlanId: plan._id, name: meso.name,
        focus: meso.focus, weekStart: meso.week_start,
        weekEnd: meso.week_end, totalWeeks: meso.total_weeks,
        intensityLevel: meso.intensity_level, order: meso.order,
      });

      for (const micro of meso.microcycles) {
        const microDoc = await Microcycle.create({
          mesocycleId: mesoDoc._id, weekNumber: micro.week_number,
          isDeload: micro.is_deload, theme: micro.theme,
          volumeTargets: micro.volume_targets,
        });

        for (const session of micro.sessions) {
          await WorkoutSession.create({
            microcycleId: microDoc._id, athleteId,
            dayLabel: session.day_label, status: "planned",
            exercises: session.exercises,
          });
        }
      }
    }

    res.status(201).json({ message: "Plan generated", planId: plan._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await MasterPlan.findById(req.params.planId)
      .populate("coachId", "name email")
      .populate("athleteId", "name email");
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
    res.status(500).json({ message: err.message });
  }
};

export const getAthletePlans = async (req, res) => {
  try {
    const plans = await MasterPlan.find({ athleteId: req.params.athleteId })
      .populate("coachId", "name email").sort("-createdAt");
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