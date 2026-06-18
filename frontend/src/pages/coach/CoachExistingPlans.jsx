import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Target,
  TrendingUp,
  ChevronRight,
  Dumbbell,
  Clock3,
} from "lucide-react";

import api from "../../lib/axios";
import { useAuthStore } from "../../../store/authStore";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

function PlanCard({ plan }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl border overflow-hidden
                 transition-all hover:border-green/30"
      style={{
        borderColor: "var(--glass-border)",
      }}
    >
      {/* Top Glow */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(57,255,20,0.8), rgba(57,255,20,0.1))",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs tracking-widest font-semibold text-green mb-2">
              AI PERIODIZED PLAN
            </p>

            <h2
              className="font-display text-2xl font-800 uppercase tracking-tight"
              style={{ color: "var(--text)" }}
            >
              {plan.title}
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {plan.status} plan
            </p>
          </div>

          <div
            className="w-12 h-12 rounded-2xl flex items-center
                       justify-center border"
            style={{
              borderColor: "rgba(57,255,20,0.2)",
              backgroundColor: "rgba(57,255,20,0.08)",
            }}
          >
            <Dumbbell size={20} className="text-green" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="rounded-xl p-3 border"
            style={{
              borderColor: "var(--glass-border)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock3 size={14} className="text-green" />
              <span
                className="text-xs font-semibold tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                DURATION
              </span>
            </div>

            <p
              className="font-display text-xl font-bold"
              style={{ color: "var(--text)" }}
            >
              {plan.totalWeeks}
            </p>

            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              weeks
            </p>
          </div>

          <div
            className="rounded-xl p-3 border"
            style={{
              borderColor: "var(--glass-border)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-green" />
              <span
                className="text-xs font-semibold tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                START DATE
              </span>
            </div>

            <p
              className="font-display text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              {new Date(plan.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status + metadata */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              backgroundColor: "rgba(57,255,20,0.08)",
              border: "1px solid rgba(57,255,20,0.15)",
              color: "var(--green)",
            }}
          >
            {plan.status.toUpperCase()}
          </div>

          <div
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
            }}
          >
            Created {new Date(plan.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* CTA */}
        <Link
        to={`/coach/plan/fullPlan/${plan._id}`}
          className="w-full py-3 rounded-xl flex items-center
                     justify-center gap-2 text-sm font-semibold
                     transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: "rgba(57,255,20,0.12)",
            color: "var(--green)",
            border: "1px solid rgba(57,255,20,0.2)",
          }}
        >
          View Full Plan
          <ChevronRight size={15} />
        </Link>
      </div>
    </motion.div>
  );
}

const CoachExistingPlans = () => {
  const { athleteId } = useParams();

  const [plans, setPlans] = useState([]);

  const { user } = useAuthStore();

  useEffect(() => {
    const fetchMicroPlans = async () => {
      try {
        const res = await api.get(
          `/plan/get-microPlans/${user.id}/${athleteId}`
        );

        // console.log(res.data);

        setPlans(res.data.plan);

      } catch (error) {
        console.log(error);
      }
    };

    if (user?.id && athleteId) {
      fetchMicroPlans();
    }
  }, [athleteId, user]);

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] font-semibold text-green mb-2">
          COACH DASHBOARD
        </p>

        <h1
          className="font-display text-4xl sm:text-5xl font-900 uppercase tracking-tight mb-3"
          style={{ color: "var(--text)" }}
        >
          Existing Plans
        </h1>

        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Browse and manage all generated athlete programs
        </p>
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div
          className="glass-card rounded-3xl p-10 text-center border"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5
                       flex items-center justify-center"
            style={{
              backgroundColor: "rgba(57,255,20,0.08)",
              border: "1px solid rgba(57,255,20,0.15)",
            }}
          >
            <Target size={34} className="text-green" />
          </div>

          <h2
            className="font-display text-2xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            No Plans Yet
          </h2>

          <p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Generate a training plan to get started.
          </p>
        </div>
      )}

      {/* Plans Grid */}
      {plans.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CoachExistingPlans;