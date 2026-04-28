import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema(
  {
    masterPlanId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "MasterPlan",
      required: true,
    },
    athleteId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    weekNumber:      { type: Number, required: true },
    summaryBullets:  [{ type: String }], 
    anomalyInsights: { type: String, default: "" },
    pdfUrl:          { type: String, default: "" },
    generatedAt:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);


weeklyReportSchema.index({ masterPlanId: 1, weekNumber: -1 });

export default mongoose.model("WeeklyReport", weeklyReportSchema);