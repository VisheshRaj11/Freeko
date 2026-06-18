import axios from "axios";
import WorkoutSession from "../models/WorkoutSession.js";
import Microcycle    from "../models/Microcycle.js";
import Mesocycle     from "../models/Mesocycle.js";
import MasterPlan    from "../models/MasterPlan.js";

const AI = process.env.AI_SERVICE_URL;

export const logWorkout = async (req, res) => {
  const { exercises } = req.body
  // console.log(exercises)

  try {
    // console.log(req.params);
    // ── 1. Find and update session ──────────────────────────
    const session = await WorkoutSession.findById(req.params.sessionId)
    if (!session) return res.status(404).json({ message: "Session not found" })

    // Save original planned exercises BEFORE overwriting
    const plannedExercises = [...(session.exercises || [])]

    session.exercises = exercises
    session.status    = "completed"
    session.loggedAt  = new Date()
    await session.save()

    // ── 2. Fetch plan context (micro + meso) ────────────────
    const micro = await Microcycle.findById(session.microcycleId).lean()
    const meso  = await Mesocycle.findById(micro?.mesocycleId).lean()

    // ── 3. Fetch recent completed sessions for trends ───────
    const recentSessions = await WorkoutSession.find({
      athleteId: session.athleteId,
      status:    "completed",
      _id:       { $ne: session._id },  // exclude current session
    })
      .sort("-loggedAt")
      .limit(10)
      .lean()

    // ── 4. Find previous same session type for weight compare
    // e.g. previous "Monday — Push Day" session
    const sessionType = session.dayLabel
      ?.split("—")[1]?.trim().toLowerCase() ||
      session.dayLabel?.split("-")[1]?.trim().toLowerCase() || ""

    const previousSameSession = recentSessions.find((s) =>
      s.dayLabel?.toLowerCase().includes(sessionType) &&
      s.status === "completed"
    )

    // ── 5. Build enriched exercise comparison ───────────────
    const exerciseComparison = exercises.map((actual) => {
      // What PLAN originally had for this exercise (weight=0, but rpe/sets/reps matter)
      const plannedEx = plannedExercises.find(
        (e) => e.name?.toLowerCase() === actual.name?.toLowerCase()
      )

      // What athlete did LAST TIME for same exercise in same session type
      const prevEx = previousSameSession?.exercises?.find(
        (e) => e.name?.toLowerCase() === actual.name?.toLowerCase()
      )

      return {
        name:            actual.name,
        // ── Actual logged today ──
        actual_sets:     actual.sets     || 0,
        actual_reps:     actual.reps     || 0,
        actual_weight:   actual.weight   || 0,
        actual_rpe:      actual.rpe      || 0,
        completed:       actual.completed ?? true,
        // ── Planned targets (weight always 0, use rpe/sets/reps) ──
        planned_sets:    plannedEx?.sets  || actual.sets  || 0,
        planned_reps:    plannedEx?.reps  || actual.reps  || 0,
        planned_rpe:     plannedEx?.rpe   || 7,            // RPE is the key target
        // ── Previous same session (for weight/rpe trend) ──
        previous_weight: prevEx?.weight   ?? null,
        previous_rpe:    prevEx?.rpe      ?? null,
        previous_reps:   prevEx?.reps     ?? null,
        // ── Computed changes ──
        weight_change:
          prevEx?.weight != null && actual.weight != null
            ? actual.weight - prevEx.weight
            : null,
        rpe_change:
          prevEx?.rpe != null && actual.rpe != null
            ? actual.rpe - prevEx.rpe
            : null,
        reps_change:
          prevEx?.reps != null && actual.reps != null
            ? actual.reps - prevEx.reps
            : null,
        // ── vs plan ──
        rpe_vs_plan:
          plannedEx?.rpe != null && actual.rpe != null
            ? actual.rpe - plannedEx.rpe
            : null,
        reps_vs_plan:
          plannedEx?.reps != null && actual.reps != null
            ? actual.reps - plannedEx.reps
            : null,
        sets_vs_plan:
          plannedEx?.sets != null && actual.sets != null
            ? actual.sets - plannedEx.sets
            : null,
      }
    })

    // ── 6. Call FastAPI anomaly detection ───────────────────
    const { data } = await axios.post(`${AI}/detect-anomaly`, {
      current_session: {
        dayLabel:            session.dayLabel,
        exercise_comparison: exerciseComparison,
        total_sets_actual:   exercises.reduce((t, e) => t + (e.sets || 0), 0),
        total_sets_planned:  plannedExercises.reduce((t, e) => t + (e.sets || 0), 0),
        session_type:        sessionType,
      },
      recent_sessions: recentSessions.map((s) => ({
        dayLabel:  s.dayLabel,
        loggedAt:  s.loggedAt,
        status:    s.status,
        exercises: s.exercises?.map((e) => ({
          name:   e.name,
          sets:   e.sets,
          reps:   e.reps,
          weight: e.weight,
          rpe:    e.rpe,
        })),
      })),
      plan_context: {
        focus:          meso?.focus          || "general",
        intensity:      meso?.intensityLevel || "moderate",
        volume_targets: micro?.volumeTargets || {},
        is_deload:      micro?.isDeload      || false,
        week_number:    micro?.weekNumber    || 1,
      },
    })

    // ── 7. Save anomaly report ──────────────────────────────
    session.aiAnomalyReport = {
      detected:    data.anomaly_detected,
      summary:     data.summary     || "",
      flags:       data.flags       || [],
      suggestion:  data.suggestion  || "",
      generatedAt: new Date(),
    }
    await session.save()

    res.json({
      message:       "Workout logged",
      session,
      anomalyReport: session.aiAnomalyReport,
    })
  } catch (err) {
    console.error("logWorkout error:", err.message)
    res.status(500).json({ message: err.message })
  }
}


export const getSession = async (req, res) => {
  try {
    const s = await WorkoutSession.findById(req.params.sessionId)
    .populate('microcycleId', 'weekNumber');
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAthleteSessions = async (req, res) => {
  // console.log(req.params.athleteId);
  try {
    const sessions = await WorkoutSession.find({ athleteId: req.params.athleteId })
      .sort("-loggedAt").limit(50);
    // console.log(sessions);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeExercise = async(req, res) => {
  try {
    const {sessionId, exerciseId} = req.params;

    const session = await WorkoutSession.findById(sessionId);

      if (!session) {
      return res.status(404).json({
        message: "Session not found"
      })
    }

    const exercise = session.exercises.id(exerciseId)

     if (!exercise) {
        return res.status(404).json({
          message: "Exercise not found"
        })
      }

        exercise.completed = true

      await session.save()

      res.json({
        success: true,
        exercise
      })

  } catch (error) {
      res.status(500).json({
        message: error.message
      })

  }
}

export const completeSession = async(req, res) => {
  try {
    const s = await WorkoutSession.findByIdAndUpdate(
      req.params.sessionId, {status: 'completed', loggedAt: new Date()}, {new: true});
    res.json(s);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
}

export const skipSession = async (req, res) => {
  try {
    // console.log(sessionId)
    const s = await WorkoutSession.findByIdAndUpdate(
      req.params.sessionId, { status: "skipped" }, { new: true }
    );
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};