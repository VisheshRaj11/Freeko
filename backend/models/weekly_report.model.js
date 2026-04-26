import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema({
    masterPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterPlan",
        required: true,
        index: true
    },

    athleteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    weekNumber: {
        type: Number,
        required: true
    },

    summaryBullets: [
        { type: String }
    ],

    anomalyInsights: {
        type: String
    },

    pdfUrl: {
        type: String
    },

    generatedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

export const WeeklyReportModel = mongoose.model("WeeklyReport", weeklyReportSchema);