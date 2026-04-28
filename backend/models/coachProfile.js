import mongoose from "mongoose";

const coachProfileSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    specialization:  { type: String, default: "" },
    certifications:  [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    bio:             { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CoachProfile", coachProfileSchema);