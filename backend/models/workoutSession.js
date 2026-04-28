import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  sets:      { type: Number },
  reps:      { type: Number },
  weight:    { type: Number, default: 0 },    // kg
  rpe:       { type: Number },                // 1–10 rate of perceived exertion
  notes:     { type: String, default: "" },
  completed: { type: Boolean, default: false },
});

const workoutSessionSchema = new mongoose.Schema(
  {
    microcycleId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Microcycle",
      required: true,
    },
    athleteId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    dayLabel: { type: String, required: true },  // "Monday - Push"
    status: {
      type:    String,
      enum:    ["planned", "in_progress", "completed", "skipped"],
      default: "planned",
    },
    exercises: [exerciseSchema],
    aiAnomalyReport: {
      detected:    { type: Boolean, default: false },
      summary:     { type: String,  default: "" },
      flags:       [{ type: String }],   // ["shoulder_fatigue", "bench_drop"]
      suggestion:  { type: String,  default: "" },
      generatedAt: { type: Date },
    },
    loggedAt: { type: Date },
  },
  { timestamps: true }
);

// Fast queries — find all sessions for an athlete sorted by date
workoutSessionSchema.index({ athleteId: 1, loggedAt: -1 });

export default mongoose.model("WorkoutSession", workoutSessionSchema);