import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock3,
  Dumbbell,
  Flame,
  Layers3,
  ShieldAlert,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../lib/axios";

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

function IntensityBadge({ level }) {
  const map = {
    low: {
      bg: "rgba(57,255,20,0.12)",
      color: "#39ff14",
      label: "LOW",
    },

    moderate: {
      bg: "rgba(255,200,0,0.12)",
      color: "#FFC800",
      label: "MODERATE",
    },

    high: {
      bg: "rgba(255,80,80,0.12)",
      color: "#FF5050",
      label: "HIGH",
    },

    peak: {
      bg: "rgba(255,50,50,0.15)",
      color: "#ff3232",
      label: "PEAK",
    },
  };

  const cfg = map[level] || map.moderate;

  return (
    <div
      className="px-3 py-1 rounded-xl text-xs font-bold tracking-widest"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
      }}
    >
      {cfg.label}
    </div>
  );
}

function VolumeChart({ microcycles }) {
  const data = microcycles.map((m) => ({
    week: `W${m.weekNumber}`,
    chest: m.volumeTargets?.chest || 0,
    back: m.volumeTargets?.back || 0,
    legs: m.volumeTargets?.legs || 0,
  }));

  return (
    <div
      className="glass-card rounded-2xl p-4 border h-[280px]"
      style={{
        borderColor: "var(--glass-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={16} className="text-green" />

        <h3
          className="font-display text-lg uppercase font-bold"
          style={{ color: "var(--text)" }}
        >
          Volume Progression
        </h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="legs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopOpacity={0.4} />
              <stop offset="95%" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

          <XAxis dataKey="week" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="legs"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#legs)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ExerciseCard({ exercise }) {
  return (
    <div
      className="rounded-xl p-3 border transition-all hover:border-green/30"
      style={{
        borderColor: "var(--glass-border)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4
            className="font-semibold text-sm mb-1"
            style={{ color: "var(--text)" }}
          >
            {exercise.name}
          </h4>

          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {exercise.notes}
          </p>
        </div>

        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: "rgba(57,255,20,0.08)",
          }}
        >
          <Dumbbell size={14} className="text-green" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { label: "SETS", value: exercise.sets },
          { label: "REPS", value: exercise.reps },
          { label: "RPE", value: exercise.rpe },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-2 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              {item.label}
            </p>

            <p
              className="font-bold mt-1"
              style={{ color: "var(--text)" }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionCard({ session }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        borderColor: "var(--glass-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-4 flex items-center justify-between
                   hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: "rgba(57,255,20,0.08)",
            }}
          >
            <Zap size={18} className="text-green" />
          </div>

          <div className="text-left">
            <h3
              className="font-semibold"
              style={{ color: "var(--text)" }}
            >
              {session.dayLabel}
            </h3>

            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {session.exercises?.length} exercises
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp size={18} style={{ color: "var(--text-muted)" }} />
        ) : (
          <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="grid md:grid-cols-2 gap-3">
              {session.exercises?.map((exercise, i) => (
                <ExerciseCard key={i} exercise={exercise} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MicrocycleCard({ micro }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        borderColor: micro.isDeload
          ? "rgba(255,200,0,0.25)"
          : "var(--glass-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between
                   hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: "rgba(57,255,20,0.08)",
            }}
          >
            <Calendar size={20} className="text-green" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-display text-lg uppercase font-bold"
                style={{ color: "var(--text)" }}
              >
                Week {micro.weekNumber}
              </h3>

              {micro.isDeload && (
                <div
                  className="px-2 py-1 rounded-lg text-[10px]
                             font-bold tracking-widest"
                  style={{
                    backgroundColor: "rgba(255,200,0,0.12)",
                    color: "#FFC800",
                  }}
                >
                  DELOAD
                </div>
              )}
            </div>

            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {micro.theme}
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp size={18} style={{ color: "var(--text-muted)" }} />
        ) : (
          <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-5"
          >
            {/* Volume Targets */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
              {Object.entries(micro.volumeTargets || {}).map(
                ([muscle, value]) => (
                  <div
                    key={muscle}
                    className="rounded-xl p-3 text-center"
                    style={{
                      backgroundColor: "rgba(57,255,20,0.05)",
                      border: "1px solid rgba(57,255,20,0.1)",
                    }}
                  >
                    <p className="text-green font-bold text-xl">
                      {value}
                    </p>

                    <p
                      className="text-xs capitalize mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {muscle}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-3">
              {micro.sessions?.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MesocycleCard({ meso }) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      variants={fadeUp}
      className="glass-card rounded-3xl border overflow-hidden"
      style={{
        borderColor: "var(--glass-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex items-center justify-between
                   hover:bg-white/5 transition-all"
      >
        <div className="flex items-start gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center
                       justify-center border"
            style={{
              backgroundColor: "rgba(57,255,20,0.08)",
              borderColor: "rgba(57,255,20,0.2)",
            }}
          >
            <Layers3 size={24} className="text-green" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2
                className="font-display text-2xl uppercase font-900"
                style={{ color: "var(--text)" }}
              >
                {meso.name}
              </h2>

              <IntensityBadge level={meso.intensityLevel} />
            </div>

            <p
              className="text-sm mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {meso.focus}
            </p>

            <div className="flex flex-wrap gap-2">
              <div
                className="px-3 py-1 rounded-xl text-xs"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "var(--text-muted)",
                }}
              >
                Week {meso.weekStart} → {meso.weekEnd}
              </div>

              <div
                className="px-3 py-1 rounded-xl text-xs"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "var(--text-muted)",
                }}
              >
                {meso.microcycles?.length} microcycles
              </div>
            </div>
          </div>
        </div>

        {open ? (
          <ChevronUp size={20} style={{ color: "var(--text-muted)" }} />
        ) : (
          <ChevronDown size={20} style={{ color: "var(--text-muted)" }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-6"
          >
            <div className="mb-5">
              <VolumeChart microcycles={meso.microcycles} />
            </div>

            <div className="flex flex-col gap-4">
              {meso.microcycles?.map((micro) => (
                <MicrocycleCard
                  key={micro._id}
                  micro={micro}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CoachFullPlan = () => {
  const { planId } = useParams();

  const [fullPlan, setFullPlan] = useState(null);

  useEffect(() => {
    const fetchFullPlan = async () => {
      try {
        const res = await api.get(`/plan/${planId}`);

        // console.log(res.data);

        setFullPlan(res.data);

      } catch (error) {
        console.log(error);
      }
    };

    fetchFullPlan();
  }, [planId]);

  const totalSessions = useMemo(() => {
    if (!fullPlan?.mesocycles) return 0;

    return fullPlan.mesocycles.reduce((acc, meso) => {
      return (
        acc +
        meso.microcycles.reduce((mAcc, micro) => {
          return mAcc + micro.sessions.length;
        }, 0)
      );
    }, 0);
  }, [fullPlan]);

  if (!fullPlan) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="text-center">
          <Brain size={40} className="text-green mx-auto mb-4 animate-pulse" />

          <p style={{ color: "var(--text-muted)" }}>
            Loading Full Plan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs tracking-[0.25em] font-semibold text-green mb-2">
          AI COACH SYSTEM
        </p>

        <h1
          className="font-display text-4xl sm:text-5xl font-900 uppercase tracking-tight mb-3"
          style={{ color: "var(--text)" }}
        >
          {fullPlan.plan.title}
        </h1>

        <p
          className="text-sm max-w-3xl"
          style={{ color: "var(--text-muted)" }}
        >
          Elite AI-generated periodized training system with progressive
          overload, mesocycle optimization, deload automation,
          and athlete-specific exercise progression.
        </p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Calendar,
            label: "TOTAL WEEKS",
            value: fullPlan.plan.totalWeeks,
          },

          {
            icon: Layers3,
            label: "MESOCYCLES",
            value: fullPlan.mesocycles.length,
          },

          {
            icon: Zap,
            label: "SESSIONS",
            value: totalSessions,
          },

          {
            icon: Trophy,
            label: "STATUS",
            value: fullPlan.plan.status,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="glass-card rounded-2xl p-5 border"
            style={{
              borderColor: "var(--glass-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <item.icon size={20} className="text-green" />

              <div
                className="w-10 h-10 rounded-xl"
                style={{
                  backgroundColor: "rgba(57,255,20,0.08)",
                }}
              />
            </div>

            <p
              className="text-xs tracking-widest font-semibold mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {item.label}
            </p>

            <h2
              className="font-display text-3xl font-900 uppercase"
              style={{ color: "var(--text)" }}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Prompt Used */}
      {fullPlan.plan.aiMetadata?.prompt && (
        <div
          className="glass-card rounded-2xl border p-5 mb-8"
          style={{
            borderColor: "var(--glass-border)",
          }}
        >
          <div className="flex items-start gap-3">
            <Brain size={18} className="text-green mt-1" />

            <div>
              <p className="text-green text-xs tracking-widest font-semibold mb-2">
                AI PLAN CONTEXT
              </p>

              <p
                className="text-sm italic"
                style={{ color: "var(--text-muted)" }}
              >
                {fullPlan.plan.aiMetadata?.prompt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mesocycles */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {fullPlan.mesocycles?.map((meso) => (
          <MesocycleCard
            key={meso._id}
            meso={meso}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default CoachFullPlan;