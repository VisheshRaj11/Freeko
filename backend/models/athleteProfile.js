import mongoose from "mongoose";

const athleteProfileSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    assignedCoachId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },
    fitnessLevel: {
      type:    String,
      enum:    ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goals:           [{ type: String }],      // ["lose fat", "build muscle"]
    weaknesses:      [{ type: String }],      // ["lower back", "rear delts"]
    weight:          { type: Number },        // kg
    height:          { type: Number },        // cm
    dateOfBirth:     { type: Date },
    competitionDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("AthleteProfile", athleteProfileSchema);