// import axios from "axios";
// import ChatMessage   from "../models/chatMessage.js";
// import WorkoutSession from "../models/workoutSession.js";
// import WeeklyReport  from "../models/weeklyReport.js";
// import MasterPlan    from "../models/masterPlan.js";
// import Mesocycle     from "../models/mesoCycle.js";
// import Microcycle    from "../models/microCycle.js";
// import { cached, invalidate, TTL } from "../utils/cache.js"

// const AI = process.env.AI_SERVICE_URL;

// export const generateWeeklyReport = async (req, res) => {
//   const {planId, weekNumber} = req.body
//   try {
//     const plan = await MasterPlan.findById(planId);
//     if (!plan) return;

//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     console.log(planId + " " + weekNumber);

//     const messages = await ChatMessage.find({
//       masterPlanId: planId, createdAt: { $gte: oneWeekAgo },
//     }).populate("senderId", "name role").lean();

//     // console.log(messages);

//     const mesocycles = await Mesocycle.find({ masterPlanId: planId }).lean();
//     const mesoIds    = mesocycles.map((m) => m._id);
//     const microcycles = await Microcycle.find({ mesocycleId: { $in: mesoIds }, weekNumber }).lean();
//     const microIds   = microcycles.map((m) => m._id);

//     const sessions = await WorkoutSession.find({
//       microcycleId: { $in: microIds }, athleteId: plan.athleteId,
//     }).lean();

//     // console.log(sessions);

//     const { data } = await axios.post(`${AI}/summarize-week`, {
//       plan_id:    planId,
//       athlete_id: plan.athleteId,
//       week_number: weekNumber,
//       chat_messages:    messages.map((m) => ({
//         sender: m.senderId.name, role: m.senderId.role,
//         content: m.content, time: m.createdAt,
//       })),
//       workout_sessions: sessions,
//     });

//     const report = await WeeklyReport.create({
//       masterPlanId:    planId,
//       athleteId:       plan.athleteId,
//       weekNumber,
//       summaryBullets:  data.summary_bullets,
//       anomalyInsights: data.anomaly_insights,
//       pdfUrl:          data.pdf_url || "",
//     });

//      await invalidate(`report:${planId}:all`)

//     // console.log(`✅ Weekly report generated for plan ${planId}, week ${weekNumber}`)
//     return report

//   } catch (err) {
//     console.error("Report error:", err.message);
//   }
// };

// export const getReports = async (req, res) => {
//   try {
//    const planId = req.params.planId
//     const cacheKey = `report:${planId}:all`

//     const reports = await cached(cacheKey, TTL.LONG, async () => {
//       return WeeklyReport.find({ masterPlanId: planId }).sort("weekNumber").lean()
//     })

//     return res.json(reports)
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getWeekReport = async (req, res) => {
//   try {
//     const { planId, weekNumber } = req.params
//     const cacheKey = `report:${planId}:week:${weekNumber}`

//     const report = await cached(cacheKey, TTL.LONG, async () => {
//       return WeeklyReport.findOne({
//         masterPlanId: planId,
//         weekNumber:   Number(weekNumber),
//       }).lean()
//     })

//     if (!report) return res.status(404).json({ message: "Not found" });
//     res.json(report);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


import axios from "axios"
import ChatMessage    from "../models/chatMessage.js"
import WorkoutSession  from "../models/workoutSession.js"
import WeeklyReport    from "../models/weeklyReport.js"
import MasterPlan      from "../models/masterPlan.js"
import Mesocycle       from "../models/mesoCycle.js"
import Microcycle      from "../models/microCycle.js"
import { cached, invalidate, TTL } from "../utils/cache.js"

const AI = process.env.AI_SERVICE_URL

// ── Core logic — reusable by HTTP route and cron job ────────────
export const buildWeeklyReport = async (planId, weekNumber) => {
  const plan = await MasterPlan.findById(planId)
  if (!plan) throw new Error("Plan not found")

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const messages = await ChatMessage.find({
    masterPlanId: planId,
    createdAt:    { $gte: oneWeekAgo },
  }).populate("senderId", "name role").lean()

  const mesocycles = await Mesocycle.find({ masterPlanId: planId }).lean()
  const mesoIds     = mesocycles.map((m) => m._id)

  const microcycles = await Microcycle.find({
    mesocycleId: { $in: mesoIds }, weekNumber,
  }).lean()
  const microIds = microcycles.map((m) => m._id)

  const sessions = await WorkoutSession.find({
    microcycleId: { $in: microIds }, athleteId: plan.athleteId,
  }).lean()

  // Build chat_messages payload — matches Python's expected {role, content} shape
  const chatPayload = messages.map((m) => ({
    role: m.senderId?.role ||
          (m.senderId?._id?.toString() === plan.athleteId.toString() ? "athlete" : "coach"),
    content: m.content || "",
    time:    m.createdAt,
  }))

  console.log(`Calling AI service: ${AI}/summarize-week`) // ← debug line, remove later

  const { data } = await axios.post(`${AI}/summarize-week`, {
    plan_id:          planId,
    athlete_id:       plan.athleteId,
    week_number:      weekNumber,
    chat_messages:    chatPayload,
    workout_sessions: sessions,
  })

  const report = await WeeklyReport.create({
    masterPlanId:    planId,
    athleteId:       plan.athleteId,
    weekNumber,
    summaryBullets:  data.summary_bullets,
    anomalyInsights: data.anomaly_insights,
    pdfUrl:          data.pdf_url || "",
  })

  await invalidate(`report:${planId}:all`)

  return report
}

// ── HTTP route — POST /api/report/generate ──────────────────────
export const generateWeeklyReport = async (req, res) => {
  const { planId, weekNumber } = req.body

  if (!planId || weekNumber === undefined) {
    return res.status(400).json({ message: "planId and weekNumber are required" })
  }

  try {
    const report = await buildWeeklyReport(planId, weekNumber)
    return res.status(201).json(report)
  } catch (err) {
    console.error("Report error:", err.response?.data || err.message)
    return res.status(500).json({
      message: err.response?.data?.detail || err.message,
    })
  }
}

// ── GET /api/report/:planId ──────────────────────────────────────
export const getReports = async (req, res) => {
  try {
    const planId = req.params.planId
    const cacheKey = `report:${planId}:all`

    const reports = await cached(cacheKey, TTL.LONG, async () => {
      return WeeklyReport.find({ masterPlanId: planId }).sort("weekNumber").lean()
    })

    return res.json(reports)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── GET /api/report/:planId/:weekNumber ──────────────────────────
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

    if (!report) return res.status(404).json({ message: "Not found" })
    res.json(report)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}