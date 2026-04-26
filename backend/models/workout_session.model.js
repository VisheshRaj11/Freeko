import mongoose from "mongoose";

const workoutSessionSchema = new mongoose.Schema({
    microcycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Microcycle",
        required: true,
        index: true
    },

    athleteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    dayLabel: { 
        type: String, 
        required: true 
    },

    status: {
        type: String,
        enum: ["pending", "completed", "skipped"],
        default: "pending"
    },

    exercises: [
        {
            name: String,
            sets: Number,
            reps: Number,
            weight: Number,
            notes: String
        }
    ],

    aiAnomalyReport: {
        type: Object
    },

    loggedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

export const WorkoutSessionModel = mongoose.model("WorkoutSession", workoutSessionSchema);