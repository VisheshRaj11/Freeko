import mongoose from "mongoose";

const masterPlanSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coach",
        required: true
    },

    athleteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // assuming athlete is a user
        required: true
    },

    title: { type: String, required: true },

    status: {
        type: String,
        enum: ["active", "completed", "draft"],
        default: "draft"
    },

    totalWeeks: { type: Number },

    startDate: { type: Date },

    aiMetadata: { type: Object }

}, {
    timestamps: true
});

 const MasterPlan = mongoose.model("MasterPlan", masterPlanSchema);
 export default MasterPlan;