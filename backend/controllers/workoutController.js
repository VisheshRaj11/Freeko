import axios from "axios";
import WorkoutSession from "../models/WorkoutSession.js";
import Microcycle    from "../models/Microcycle.js";
import Mesocycle     from "../models/Mesocycle.js";
import MasterPlan    from "../models/MasterPlan.js";

const AI = process.env.AI_SERVICE_URL;

export const logWorkout = async (req, res) => {
  const { exercises } = req.body;
  try {
    const session = await WorkoutSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.exercises = exercises;
    session.status    = "completed";
    session.loggedAt  = new Date();
    await session.save();

    const recentSessions = await WorkoutSession.find({
      athleteId: req.user._id, status: "completed"
    }).sort("-loggedAt").limit(10).lean();

    const micro = await Microcycle.findById(session.microcycleId).lean();
    const meso  = await Mesocycle.findById(micro.mesocycleId).lean();

    const { data } = await axios.post(`${AI}/detect-anomaly`, {
      current_session: session.toObject(),
      recent_sessions: recentSessions,
      plan_context: {
        focus:          meso.focus,
        intensity:      meso.intensityLevel,
        volume_targets: micro.volumeTargets,
        is_deload:      micro.isDeload,
      },
    });

    session.aiAnomalyReport = {
      detected:    data.anomaly_detected,
      summary:     data.summary,
      flags:       data.flags,
      suggestion:  data.suggestion,
      generatedAt: new Date(),
    };
    await session.save();

    res.json({ message: "Workout logged", session, anomalyReport: session.aiAnomalyReport });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const s = await WorkoutSession.findById(req.params.sessionId);
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAthleteSessions = async (req, res) => {
  console.log(req.params.athleteId);
  try {
    const sessions = await WorkoutSession.find({ athleteId: req.params.athleteId })
      .sort("-loggedAt").limit(50);
    console.log(sessions);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const skipSession = async (req, res) => {
  try {
    const s = await WorkoutSession.findByIdAndUpdate(
      req.params.sessionId, { status: "skipped" }, { new: true }
    );
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};