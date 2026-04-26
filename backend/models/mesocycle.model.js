import mongoose from "mongoose";

const mesocycleSchema = new mongoose.Schema({
    masterPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterPlan",
        required: true
    },

    name: { type: String, required: true },

    focus: { type: String },

    weekStart: { type: Number },

    intensityLevel: {
        type: String,
        enum: ["low", "medium", "high"]
    },

    totalWeeks: { type: Number }

}, {
    timestamps: true
});

export const MesocycleModel = mongoose.model("Mesocycle", mesocycleSchema);