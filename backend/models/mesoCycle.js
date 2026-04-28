import mongoose from "mongoose";

const mesocycleSchema = new mongoose.Schema(
  {
    masterPlanId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "MasterPlan",
      required: true,
    },
    name:  { type: String, required: true },   // "Hypertrophy Block"
    focus: { type: String, required: true },   // "muscle building"
    weekStart:  { type: Number, required: true },
    weekEnd:    { type: Number, required: true },
    totalWeeks: { type: Number, required: true },
    intensityLevel: {
      type:    String,
      enum:    ["low", "moderate", "high", "peak"],
      default: "moderate",
    },
    order: { type: Number, required: true },   // 1, 2, 3 for sorting
  },
  { timestamps: true }
);

export default mongoose.model("Mesocycle", mesocycleSchema);