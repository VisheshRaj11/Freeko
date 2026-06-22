import ChatMessage from "../models/chatMessage.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const onlineUsers = new Set()

export const registerSocketHandlers = (io) => {

  // Authenticate every socket connection via JWT
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user   = await User.findById(decoded.id).select("-passwordHash");
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.user.name} (${socket.user.role})`);

    // ── Join a room tied to a MasterPlan ──────────────────────
    socket.on("join_plan_room", (planId) => {
      socket.join(`plan_${planId}`);
      // console.log(`${socket.user.name} joined room → plan_${planId}`);
    });

    // ── Send a message ─────────────────────────────────────────
    socket.on("send_message", async ({ planId, receiverId, content }) => {
      try {
        const msg = await ChatMessage.create({
          senderId:     socket.user._id,
          receiverId,
          masterPlanId: planId,
          content,
        });

        const populated = await msg.populate("senderId", "name role avatarUrl");

        // Broadcast to everyone in the plan room
        io.to(`plan_${planId}`).emit("new_message", populated);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

      const userId = socket.user.id

      onlineUsers.add(userId)

      io.emit("online_users", Array.from(onlineUsers))

      socket.on("disconnect", () => {
        onlineUsers.delete(userId)

        io.emit("online_users", Array.from(onlineUsers))
      })

    // ── Fetch message history for a plan ───────────────────────
    socket.on("get_messages", async ({ planId, page = 1, limit = 30 }) => {
      try {
        const messages = await ChatMessage.find({ masterPlanId: planId })
          .populate("senderId", "name role avatarUrl")
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        socket.emit("message_history", messages.reverse());
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Mark messages as read ──────────────────────────────────
    socket.on("mark_read", async ({ planId, senderId }) => {
      try {
        await ChatMessage.updateMany(
          {
            masterPlanId: planId,
            senderId,
            receiverId: socket.user._id,
            readAt: null,
          },
          { readAt: new Date() }
        );

        io.to(`plan_${planId}`).emit("messages_read", {
          readBy: socket.user._id,
          planId,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Typing indicator ───────────────────────────────────────
    socket.on("typing", ({ planId }) => {
      socket.to(`plan_${planId}`).emit("user_typing", {
        userId: socket.user._id,
        name:   socket.user.name,
      });
    });

    socket.on("stop_typing", ({ planId }) => {
      socket.to(`plan_${planId}`).emit("user_stop_typing", {
        userId: socket.user._id,
      });
    });

    // ── Leave room + disconnect ────────────────────────────────
    socket.on("leave_plan_room", (planId) => {
      socket.leave(`plan_${planId}`);
      // console.log(`${socket.user.name} left room → plan_${planId}`);
    });

    socket.on("disconnect", () => {
      // console.log(`🔌 Disconnected: ${socket.user.name}`);
    });
  });
};