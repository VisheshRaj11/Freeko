import MasterPlan from "../models/masterPlan.js";
import { generateWeeklyReport } from "../controllers/reportController.js";

export const runWeeklyReportJob = async () => {
  try {
    const activePlans = await MasterPlan.find({ status: "active" });
    // console.log(`📋 Found ${activePlans.length} active plans — generating reports...`);

    for (const plan of activePlans) {
      const msPerWeek  = 7 * 24 * 60 * 60 * 1000;
      const elapsed    = Date.now() - new Date(plan.startDate).getTime();
      const weekNumber = Math.ceil(elapsed / msPerWeek);

      if (weekNumber > 0 && weekNumber <= plan.totalWeeks) {
        await generateWeeklyReport(plan._id, weekNumber);
        // console.log(`✅ Report done → Plan: ${plan.title} | Week: ${weekNumber}`);
      }
    }

    console.log("🎉 Weekly report job complete");
  } catch (err) {
    console.error("❌ Cron job failed:", err.message);
  }
};