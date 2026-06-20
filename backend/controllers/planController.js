// import axios from "axios";
// import MasterPlan    from "../models/MasterPlan.js";
// import Mesocycle     from "../models/Mesocycle.js";
// import Microcycle    from "../models/Microcycle.js";
// import WorkoutSession from "../models/WorkoutSession.js";
// import AthleteProfile from "../models/AthleteProfile.js";
// import mongoose from "mongoose";
// import { pl } from "zod/v4/locales";
// import { cached, invalidate, TTL } from "../utils/cache.js";

// const AI = process.env.AI_SERVICE_URL;


// // Add this helper function at the top of planController.js
// const sanitizeIntensity = (level) => {
//   if (!level) return "moderate"
//   const l = level.toLowerCase()
//   if (l.includes("peak"))     return "peak"
//   if (l.includes("high"))     return "high"
//   if (l.includes("low"))      return "low"
//   if (l.includes("moderate")) return "moderate"
//   return "moderate" // safe default
// }

// // Call after generating a NEW plan
// export const invalidateAthletePlanCache = async (athleteId) => {
//   await invalidate(`athlete:${athleteId}:plans`)
// }

// // Call after creating mesocycles/microcycles/sessions in plan generation
// export const invalidateFullPlanCache = async (planId) => {
//   await invalidate(`plan:${planId}:full`)
// }

// export const generatePlan = async (req, res) => {
//   const { athleteId, title, startDate, totalWeeks } = req.body;
//   // console.log(req.body);
//   try {
//     const profile = await AthleteProfile.findOne({ _id: athleteId });
//     // console.log(profile);
//     if (!profile) return res.status(404).json({ message: "Athlete not found" });
//     // console.log("Ai responed")
//     // console.log(AI);
//     const { data } = await axios.post(`${AI}/generate-plan`, {
//       athlete: {
//         fitnessLevel:    profile.fitnessLevel,
//         goals:           profile.goals,
//         weaknesses:      profile.weaknesses,
//         competitionDate: profile.competitionDate,
//         weight:          profile.weight,
//         height:          profile.height,
//       },
//       totalWeeks,
//       startDate,
//     });

//     // console.log(data);

//     const endDate = new Date(startDate);
//     endDate.setDate(endDate.getDate() + totalWeeks * 7);

//     const plan = await MasterPlan.create({
//       coachId: req.user._id, athleteId, title,
//       totalWeeks, startDate, endDate, status: "active",
//       aiMetadata: { model: "gemini-2.5-flash", generatedAt: new Date() },
//     });

//     // for (const meso of data.mesocycles) {
//     //   const mesoDoc = await Mesocycle.create({
//     //     masterPlanId: plan._id, name: meso.name,
//     //     focus: meso.focus, weekStart: meso.week_start,
//     //     weekEnd: meso.week_end, totalWeeks: meso.total_weeks,
//     //     intensityLevel: sanitizeIntensity(meso.intensity_level), order: meso.order,
//     //   });

//     //   for (const micro of meso.microcycles) {
//     //     const microDoc = await Microcycle.create({
//     //       mesocycleId: mesoDoc._id, weekNumber: micro.week_number,
//     //       isDeload: micro.is_deload, theme: micro.theme,
//     //       volumeTargets: micro.volume_targets,
//     //     });

//     //     for (const session of micro.sessions) {
//     //       await WorkoutSession.create({
//     //         microcycleId: microDoc._id, athleteId,
//     //         dayLabel: session.day_label, status: "planned",
//     //         exercises: session.exercises,
//     //       });
//     //     }
//     //   }
//     // }
    
//         const mesoInserts = data.mesocycles.map((meso, idx) => ({
//       masterPlanId:   plan._id,
//       name:           meso.name,
//       focus:          meso.focus,
//       weekStart:      meso.week_start,
//       weekEnd:        meso.week_end,
//       totalWeeks:     meso.total_weeks,
//       intensityLevel: sanitizeIntensity(meso.intensity_level),
//       order:          meso.order || idx + 1,
//     }))

//     const mesoDocs = await Mesocycle.insertMany(mesoInserts)

//     // Create all microcycles at once
//     const microInserts = []
//     data.mesocycles.forEach((meso, i) => {
//       meso.microcycles?.forEach((micro) => {
//         microInserts.push({
//           mesocycleId:   mesoDocs[i]._id,
//           weekNumber:    micro.week_number,
//           isDeload:      micro.is_deload,
//           theme:         micro.theme,
//           volumeTargets: micro.volume_targets,
//         })
//       })
//     })

//     const microDocs = await Microcycle.insertMany(microInserts)

//     // Create all sessions at once
//     const sessionInserts = []
//     let microIdx = 0
//     data.mesocycles.forEach((meso) => {
//       meso.microcycles?.forEach((micro) => {
//         micro.sessions?.forEach((session) => {
//           sessionInserts.push({
//             microcycleId: microDocs[microIdx]._id,
//             athleteId,
//             dayLabel:     session.day_label,
//             status:       "planned",
//             exercises:    session.exercises,
//           })
//         })
//         microIdx++
//       })
//     })

//     await WorkoutSession.insertMany(sessionInserts)

//     await invalidateAthletePlanCache(athleteId)

//     res.status(201).json({ message: "Plan generated", planId: plan._id });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getMicroPlans = async(req, res) => {
//   // console.log(req.params);
//   const {coachId, athleteId} = req.params;
//   // const { coachId, athleteId } = req.params
//   if (!coachId) return res.json("coach and athlete are mandatory")
//   try {
//     const cacheKey = `coach:${coachId}:microplans:${athleteId}`
//     // const data = await MasterPlan.find({coachId});
//     const data = await cached(cacheKey, TTL.MEDIUM, async () => {
//       return MasterPlan.find({ coachId }).lean()
//     })
//     // console.log(data);
//     return res.json({plan: data});
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// }

// export const getPlan = async (req, res) => {
//   // console.log(req.params);
//   try {

//      const planId = req.params.planId
//      const cacheKey = `plan:${planId}:full`

//      const plan = await cached(cacheKey, TTL.MEDIUM, async() => {
//         return await MasterPlan.findById(req.params.planId)
//       .populate("coachId", "name email")
//       .populate("athleteId", "name email");
//      })
//     // const plan = 

//     // console.log(plan);

//     if (!plan) return res.status(404).json({ message: "Not found" });

//     const mesocycles = await Mesocycle.find({ masterPlanId: plan._id }).sort("order");
//     const result = [];

//     for (const meso of mesocycles) {
//       const microcycles = await Microcycle.find({ mesocycleId: meso._id }).sort("weekNumber");
//       const mesoObj = meso.toObject();
//       mesoObj.microcycles = [];
//       for (const micro of microcycles) {
//         const sessions  = await WorkoutSession.find({ microcycleId: micro._id });
//         const microObj  = micro.toObject();
//         microObj.sessions = sessions;
//         mesoObj.microcycles.push(microObj);
//       }
//       result.push(mesoObj);
//     }

//     res.json({ plan, mesocycles: result });
//   } catch (err) {
//     console.log(err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getAthletePlans = async (req, res) => {
//    try {
//     const athleteId = req.params.athleteId
//     const cacheKey = `athlete:${athleteId}:plans`

//     const plans = await cached(cacheKey, TTL.MEDIUM, async () => {
//       return MasterPlan.find({ athleteId }).sort("-createdAt").lean()
//     })

//     res.json(plans)
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// };

// export const updatePlanStatus = async (req, res) => {
//   try {
//     const plan = await MasterPlan.findByIdAndUpdate(
//       req.params.planId, { status: req.body.status }, { new: true }
//     );
//     if (plan) {
//       // Status change affects both the full-plan cache and the athlete's plan list
//       await invalidateFullPlanCache(plan._id.toString())
//       await invalidateAthletePlanCache(plan.athleteId.toString())
//       await invalidateCoachPlansCache(plan.coachId.toString(), plan.athleteId.toString())
//     }
//     res.json(plan);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


import axios from "axios"
import MasterPlan     from "../models/MasterPlan.js"
import Mesocycle      from "../models/Mesocycle.js"
import Microcycle     from "../models/Microcycle.js"
import WorkoutSession  from "../models/WorkoutSession.js"
import AthleteProfile  from "../models/AthleteProfile.js"
import { cached, invalidate, invalidatePattern, TTL } from "../utils/cache.js"

const AI = process.env.AI_SERVICE_URL

// ── Helper ───────────────────────────────────────────────────
const sanitizeIntensity = (level) => {
  if (!level) return "moderate"
  const l = level.toLowerCase()
  if (l.includes("peak"))     return "peak"
  if (l.includes("high"))     return "high"
  if (l.includes("low"))      return "low"
  if (l.includes("moderate")) return "moderate"
  return "moderate"
}

// ── Cache invalidation helpers (declared first, used everywhere below) ──
export const invalidateAthletePlanCache = async (athleteId) => {
  await invalidate(`athlete:${athleteId}:plans`)
}

export const invalidateFullPlanCache = async (planId) => {
  await invalidate(`plan:${planId}:full`)
}

export const invalidateCoachPlansCache = async (coachId, athleteId) => {
  await invalidate(`coach:${coachId}:microplans:${athleteId}`)
}

// ── POST /api/plan/generate ─────────────────────────────────
export const generatePlan = async (req, res) => {
  const { athleteId, title, startDate, totalWeeks } = req.body

  try {
    const profile = await AthleteProfile.findOne({ _id: athleteId })
    if (!profile) return res.status(404).json({ message: "Athlete not found" })

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
    })

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + totalWeeks * 7)

    const plan = await MasterPlan.create({
      coachId: req.user._id, athleteId, title,
      totalWeeks, startDate, endDate, status: "active",
      aiMetadata: { model: "gemini-2.5-flash", generatedAt: new Date() },
    })

    // ── Bulk insert mesocycles ─────────────────────────────
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

    // ── Bulk insert microcycles ────────────────────────────
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

    // ── Bulk insert sessions ────────────────────────────────
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

    // ── Invalidate caches affected by this brand-new plan ───
    await invalidateAthletePlanCache(athleteId)
    await invalidateCoachPlansCache(req.user._id.toString(), athleteId)
    // No need to invalidate plan:{id}:full — this planId never existed before

    res.status(201).json({ message: "Plan generated", planId: plan._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── GET /api/plan/get-microPlans/:coachId/:athleteId ────────
export const getMicroPlans = async (req, res) => {
  const { coachId, athleteId } = req.params
  if (!coachId) return res.json("coach and athlete are mandatory")

  try {
    const cacheKey = `coach:${coachId}:microplans:${athleteId}`

    const data = await cached(cacheKey, TTL.MEDIUM, async () => {
      return MasterPlan.find({ coachId }).lean()
    })

    return res.json({ plan: data })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ── GET /api/plan/:planId — full nested plan ────────────────
export const getPlan = async (req, res) => {
  try {
    const planId = req.params.planId
    const cacheKey = `plan:${planId}:full`

    const result = await cached(cacheKey, TTL.MEDIUM, async () => {
      const plan = await MasterPlan.findById(planId)
        .populate("coachId", "name email")
        .populate("athleteId", "name email")
        .lean()

      if (!plan) return null

      const mesocycles = await Mesocycle.find({ masterPlanId: plan._id })
        .sort("order")
        .lean()

      const mesoOut = []
      for (const meso of mesocycles) {
        const microcycles = await Microcycle.find({ mesocycleId: meso._id })
          .sort("weekNumber")
          .lean()

        const microOut = []
        for (const micro of microcycles) {
          const sessions = await WorkoutSession.find({ microcycleId: micro._id }).lean()
          microOut.push({ ...micro, sessions })
        }
        mesoOut.push({ ...meso, microcycles: microOut })
      }

      return { plan, mesocycles: mesoOut }
    })

    if (!result) return res.status(404).json({ message: "Not found" })
    res.json(result)
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message })
  }
}

// ── GET /api/plan/athlete/:athleteId ─────────────────────────
export const getAthletePlans = async (req, res) => {
  try {
    const athleteId = req.params.athleteId
    const cacheKey = `athlete:${athleteId}:plans`

    const plans = await cached(cacheKey, TTL.MEDIUM, async () => {
      return MasterPlan.find({ athleteId }).sort("-createdAt").lean()
    })

    res.json(plans)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── PATCH /api/plan/:planId/status ───────────────────────────
export const updatePlanStatus = async (req, res) => {
  try {
    const plan = await MasterPlan.findByIdAndUpdate(
      req.params.planId, { status: req.body.status }, { new: true }
    )

    if (plan) {
      // Status change affects both the full-plan cache and the athlete's plan list
      await invalidateFullPlanCache(plan._id.toString())
      await invalidateAthletePlanCache(plan.athleteId.toString())
      await invalidateCoachPlansCache(plan.coachId.toString(), plan.athleteId.toString())
    }

    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}