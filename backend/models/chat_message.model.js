import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    masterPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterPlan"
    },

    content: {
        type: String,
        required: true
    },

    sentAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

export const ChatMessageModel = mongoose.model("ChatMessage", chatMessageSchema);