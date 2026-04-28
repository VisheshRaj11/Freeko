import mongoose from "mongoose";

const microcycleSchema = new mongoose.Schema(
  {
    mesocycleId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Mesocycle",
      required: true,
    },
    weekNumber: { type: Number, required: true },
    isDeload:   { type: Boolean, default: false },
    theme:      { type: String, default: "" },    // "high volume push week"
    volumeTargets: {
      chest:     { type: Number },
      back:      { type: Number },
      legs:      { type: Number },
      shoulders: { type: Number },
      arms:      { type: Number },
      core:      { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Microcycle", microcycleSchema);