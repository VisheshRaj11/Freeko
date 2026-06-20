import axios from "axios";
import ChatMessage   from "../models/ChatMessage.js";
import WorkoutSession from "../models/WorkoutSession.js";
import WeeklyReport  from "../models/WeeklyReport.js";
import MasterPlan    from "../models/MasterPlan.js";
import Mesocycle     from "../models/Mesocycle.js";
import Microcycle    from "../models/Microcycle.js";
import { cached, TTL } from "../utils/cache.js";

const AI = process.env.AI_SERVICE_URL;

export const generateWeeklyReport = async (req, res) => {
  const {planId, weekNumber} = req.body
  try {
    const plan = await MasterPlan.findById(planId);
    if (!plan) return;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const messages = await ChatMessage.find({
      masterPlanId: planId, createdAt: { $gte: oneWeekAgo },
    }).populate("senderId", "name role").lean();

    const mesocycles = await Mesocycle.find({ masterPlanId: planId }).lean();
    const mesoIds    = mesocycles.map((m) => m._id);
    const microcycles = await Microcycle.find({ mesocycleId: { $in: mesoIds }, weekNumber }).lean();
    const microIds   = microcycles.map((m) => m._id);

    const sessions = await WorkoutSession.find({
      microcycleId: { $in: microIds }, athleteId: plan.athleteId,
    }).lean();

    const { data } = await axios.post(`${AI}/summarize-week`, {
      plan_id:    planId,
      athlete_id: plan.athleteId,
      week_number: weekNumber,
      chat_messages:    messages.map((m) => ({
        sender: m.senderId.name, role: m.senderId.role,
        content: m.content, time: m.createdAt,
      })),
      workout_sessions: sessions,
    });

    const report = await WeeklyReport.create({
      masterPlanId:    planId,
      athleteId:       plan.athleteId,
      weekNumber,
      summaryBullets:  data.summary_bullets,
      anomalyInsights: data.anomaly_insights,
      pdfUrl:          data.pdf_url || "",
    });

     await invalidate(`report:${planId}:all`)

    // console.log(`✅ Weekly report generated for plan ${planId}, week ${weekNumber}`)
    return report

  } catch (err) {
    console.error("Report error:", err.message);
  }
};

export const getReports = async (req, res) => {
  try {
   const planId = req.params.planId
    const cacheKey = `report:${planId}:all`

    const reports = await cached(cacheKey, TTL.LONG, async () => {
      return WeeklyReport.find({ masterPlanId: planId }).sort("weekNumber").lean()
    })

    return res.json(reports)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWeekReport = async (req, res) => {
  try {
    const { planId, weekNumber } = req.params
    const cacheKey = `report:${planId}:week:${weekNumber}`

    const report = await cached(cacheKey, TTL.LONG, async () => {
      return WeeklyReport.findOne({
        masterPlanId: planId,
        weekNumber:   Number(weekNumber),
      }).lean()
    })

    if (!report) return res.status(404).json({ message: "Not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};