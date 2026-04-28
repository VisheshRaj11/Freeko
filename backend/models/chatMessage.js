import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    receiverId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    masterPlanId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "MasterPlan",
      required: true,
    },
    content: { type: String, required: true },
    readAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// Fast retrieval of all messages in a plan conversation
chatMessageSchema.index({ masterPlanId: 1, createdAt: 1 });

export default mongoose.model("ChatMessage", chatMessageSchema);