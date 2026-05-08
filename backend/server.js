import express from "express";
import { createServer } from "http";
import {Server} from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import connectDB from "./config/db.js";
import { registerSocketHandlers } from "./sockets/socket.js";
import { runWeeklyReportJob } from "./utils/cronJobs.js";

import authRoutes    from "./routes/auth.js";
import athleteRoutes from "./routes/athlete.js";
import coachRoutes   from "./routes/coach.js";
import planRoutes    from "./routes/plan.js";
import workoutRoutes from "./routes/workout.js";
import reportRoutes  from "./routes/report.js";
import anomalyRoutes from "./routes/anomaly.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {origin : process.env.CLIENT_URL, methods: ["GET", "POST", "OPTIONS"], credentials: true}
});

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    // credentials: true
}))

app.use(express.json());

registerSocketHandlers(io);

app.use("/api/auth",    authRoutes);
app.use("/api/athlete", athleteRoutes);
app.use("/api/coach",   coachRoutes);
app.use("/api/plan",    planRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/report",  reportRoutes);
app.use("/api/anomaly", anomalyRoutes);

app.get("/", (_, res) => res.json({ status: "Freeko API running 🚀" }));

cron.schedule("0 0 * * 0", () => runWeeklyReportJob());

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));