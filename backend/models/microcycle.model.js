import mongoose from "mongoose";

const microcycleSchema = new mongoose.Schema({
    mesocycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mesocycle",
        required: true
    },

    weekNumber: { type: Number, required: true },

    isDeload: { type: Boolean, default: false },

    theme: { type: String },

    volumeTargets: { type: Object }

}, {
    timestamps: true
});

export const MicrocycleModel = mongoose.model("Microcycle", microcycleSchema);