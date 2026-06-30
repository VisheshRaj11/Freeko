# import json
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from utils.llm import get_llm


# # ── Prompt Template ────────────────────────────────────────────────────────
# SUMMARY_PROMPT = PromptTemplate(
#     input_variables=["week_number", "chat_messages", "workout_sessions"],
#     template="""
# You are the weekly review AI for Freeko, an AI gym coaching platform.

# Your job is to read the coach-athlete conversation and workout data from this week
# and produce a clean structured weekly report.

# Week Number: {week_number}

# Coach-Athlete conversation this week:
# {chat_messages}

# Workout sessions completed this week:
# {workout_sessions}

# Instructions:
# - Read all chat messages and identify key decisions, concerns, feedback, and plans discussed.
# - Read all workout sessions and identify performance highlights, missed sessions, and progress.
# - Combine both into a unified weekly picture.
# - Summary bullets must be specific — mention exercise names, weights, dates where relevant.
# - Anomaly insights should flag anything concerning from both chat and workouts.
# - If there were no anomalies, say "No anomalies detected this week."

# Return ONLY valid JSON — no markdown, no explanation:
# {{
#   "summary_bullets": [
#     "Athlete completed 4 out of 5 planned sessions this week.",
#     "Bench press progressed from 80kg to 85kg on Wednesday session.",
#     "Coach adjusted squat volume after athlete reported knee discomfort on Tuesday.",
#     "Athlete hit all volume targets for chest and back muscle groups.",
#     "Deload week scheduled for next week — coach confirmed in chat on Friday."
#   ],
#   "anomaly_insights": "Athlete reported knee discomfort mid-week which was flagged by the anomaly system on Thursday's leg session. Coach proactively reduced squat volume and replaced heavy leg press with lighter leg extension work. Monitor knee health closely in the coming week before resuming full leg volume.",
#   "pdf_url": ""
# }}
# """,
# )


# # ── Main function called by the router ────────────────────────────────────
# def run_summary_chain(
#     week_number:      int,
#     chat_messages:    list,
#     workout_sessions: list,
# ) -> dict:
#     """
#     Takes week number, chat messages, and workout sessions.
#     Returns structured weekly report as a Python dict.
#     """
#     llm    = get_llm(temperature=0.3)
#     parser = StrOutputParser()

#     # LCEL pipe — same pattern as Feature 1
#     chain = SUMMARY_PROMPT | llm | parser

#     raw = chain.invoke({
#         "week_number":      week_number,
#         "chat_messages":    json.dumps(chat_messages,    default=str, indent=2),
#         "workout_sessions": json.dumps(workout_sessions, default=str, indent=2),
#     })

#     # Strip markdown fences if Gemini adds them
#     raw = (
#         raw.strip()
#         .removeprefix("```json")
#         .removeprefix("```")
#         .removesuffix("```")
#         .strip()
#     )

#     return json.loads(raw)

# import json
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from utils.llm import get_llm


# # ── Prompt Template — terse, works off pre-computed data ──────────────────
# SUMMARY_PROMPT = PromptTemplate(
#     input_variables=["week_number", "chat_highlights", "session_stats"],
#     template="""
# You are the weekly review AI for Freeko, an AI gym coaching platform.

# Week Number: {week_number}

# Pre-computed session stats (use these numbers directly, do not recompute):
# {session_stats}

# Key chat highlights this week (already filtered, not the full conversation):
# {chat_highlights}

# Write EXACTLY:
# - 4 to 5 summary bullets (max 18 words each), specific with exercise names/weights where given
# - 1 anomaly insight sentence (max 30 words). If anomaly_flags_count is 0, say
#   "No anomalies detected this week."

# Return ONLY valid JSON — no markdown, no explanation:
# {{
#   "summary_bullets": ["...", "...", "...", "..."],
#   "anomaly_insights": "...",
#   "pdf_url": ""
# }}
# """,
# )


# # ── Pre-aggregation helpers — do the heavy lifting in Python, not Gemini ──
# def _build_session_stats(workout_sessions: list) -> str:
#     completed = [s for s in workout_sessions if s.get("status") == "completed"]
#     skipped   = [s for s in workout_sessions if s.get("status") == "skipped"]

#     top_lift, top_weight, top_day = None, 0, None
#     for s in completed:
#         for ex in s.get("exercises", []):
#             wt = ex.get("weight") or 0
#             if wt > top_weight:
#                 top_weight = wt
#                 top_lift   = ex.get("name")
#                 top_day    = s.get("dayLabel")

#     anomaly_flags = []
#     for s in workout_sessions:
#         report = s.get("aiAnomalyReport") or {}
#         if report.get("detected"):
#             anomaly_flags.extend(report.get("flags", []))

#     skipped_days = [s.get("dayLabel", "Unknown") for s in skipped]

#     stats = {
#         "sessions_completed":   len(completed),
#         "sessions_skipped":     len(skipped),
#         "sessions_total":       len(workout_sessions),
#         "skipped_day_labels":   skipped_days,
#         "top_lift_name":        top_lift,
#         "top_lift_weight_kg":   top_weight,
#         "top_lift_day":         top_day,
#         "anomaly_flags_count":  len(anomaly_flags),
#         "anomaly_flags":        list(set(anomaly_flags)),
#     }
#     return json.dumps(stats)


# def _build_chat_highlights(chat_messages: list, max_messages: int = 8, max_chars: int = 100) -> str:
#     """
#     Trim chat history hard — only the most recent N messages,
#     each truncated to max_chars. This is usually the single
#     biggest token cost in the old version.
#     """
#     if not chat_messages:
#         return "No messages exchanged this week."

#     trimmed = chat_messages[-max_messages:]
#     lines = []
#     for m in trimmed:
#         role    = m.get("senderRole") or m.get("role") or "user"
#         content = (m.get("content") or "")[:max_chars]
#         lines.append(f"{role}: {content}")

#     return "\n".join(lines)


# # ── Main function called by the router ─────────────────────────────────────
# def run_summary_chain(
#     week_number:      int,
#     chat_messages:    list,
#     workout_sessions: list,
# ) -> dict:
#     """
#     Takes week number, chat messages, and workout sessions.
#     Pre-aggregates both into compact summaries before sending to Gemini,
#     then returns structured weekly report as a Python dict.
#     """
#     llm    = get_llm(temperature=0.2, max_output_tokens=512)
#     parser = StrOutputParser()

#     chain = SUMMARY_PROMPT | llm | parser

#     session_stats   = _build_session_stats(workout_sessions)
#     chat_highlights = _build_chat_highlights(chat_messages)

#     raw = chain.invoke({
#         "week_number":      week_number,
#         "session_stats":    session_stats,
#         "chat_highlights":  chat_highlights,
#     })

#     raw = (
#         raw.strip()
#         .removeprefix("```json")
#         .removeprefix("```")
#         .removesuffix("```")
#         .strip()
#     )

#     try:
#         result = json.loads(raw)
#     except json.JSONDecodeError:
#         # Fallback so a malformed Gemini response never 500s the cron job
#         completed = sum(1 for s in workout_sessions if s.get("status") == "completed")
#         total     = len(workout_sessions) or 1
#         result = {
#             "summary_bullets": [
#                 f"{completed} of {total} sessions completed this week.",
#             ],
#             "anomaly_insights": "No anomalies detected this week.",
#             "pdf_url": "",
#         }

#     # Ensure pdf_url key always exists even if Gemini omits it
#     result.setdefault("pdf_url", "")
#     return result





import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.llm import get_llm


SUMMARY_PROMPT = PromptTemplate(
    input_variables=["week_number", "chat_highlights", "session_stats"],
    template="""
You are the weekly review AI for Freeko, an AI gym coaching platform.

Week Number: {week_number}

Pre-computed session stats (use these numbers directly, do not recompute):
{session_stats}

Key chat highlights this week (already filtered, not the full conversation):
{chat_highlights}

Write EXACTLY:
- 4 to 5 summary bullets (max 18 words each), specific with exercise names/weights where given
- 1 anomaly insight sentence (max 30 words). If anomaly_flags_count is 0, say
  "No anomalies detected this week."

Return ONLY valid JSON — no markdown, no explanation:
{{
  "summary_bullets": ["...", "...", "...", "..."],
  "anomaly_insights": "...",
  "pdf_url": ""
}}
""",
)


def _build_session_stats(workout_sessions: list) -> str:
    completed = [s for s in workout_sessions if s.get("status") == "completed"]
    skipped   = [s for s in workout_sessions if s.get("status") == "skipped"]

    top_lift, top_weight, top_day = None, 0, None
    for s in completed:
        for ex in s.get("exercises", []):
            wt = ex.get("weight") or 0
            if wt > top_weight:
                top_weight = wt
                top_lift   = ex.get("name")
                top_day    = s.get("dayLabel")

    anomaly_flags = []
    for s in workout_sessions:
        report = s.get("aiAnomalyReport") or {}
        if report.get("detected"):
            anomaly_flags.extend(report.get("flags", []))

    skipped_days = [s.get("dayLabel", "Unknown") for s in skipped]

    stats = {
        "sessions_completed":   len(completed),
        "sessions_skipped":     len(skipped),
        "sessions_total":       len(workout_sessions),
        "skipped_day_labels":   skipped_days,
        "top_lift_name":        top_lift,
        "top_lift_weight_kg":   top_weight,
        "top_lift_day":         top_day,
        "anomaly_flags_count":  len(anomaly_flags),
        "anomaly_flags":        list(set(anomaly_flags)),
    }
    return json.dumps(stats)


def _build_chat_highlights(chat_messages: list, max_messages: int = 8, max_chars: int = 100) -> str:
    if not chat_messages:
        return "No messages exchanged this week."

    trimmed = chat_messages[-max_messages:]
    lines = []
    for m in trimmed:
        role    = m.get("role") or m.get("senderRole") or "user"
        content = (m.get("content") or "")[:max_chars]
        lines.append(f"{role}: {content}")

    return "\n".join(lines)


def run_summary_chain(
    week_number:      int,
    chat_messages:    list,
    workout_sessions: list,
) -> dict:
    llm    = get_llm(temperature=0.2, max_output_tokens=512)
    parser = StrOutputParser()

    chain = SUMMARY_PROMPT | llm | parser

    session_stats   = _build_session_stats(workout_sessions)
    chat_highlights = _build_chat_highlights(chat_messages)

    raw = chain.invoke({
        "week_number":     week_number,
        "session_stats":   session_stats,
        "chat_highlights": chat_highlights,
    })

    raw = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        completed = sum(1 for s in workout_sessions if s.get("status") == "completed")
        total     = len(workout_sessions) or 1
        result = {
            "summary_bullets": [
                f"{completed} of {total} sessions completed this week.",
            ],
            "anomaly_insights": "No anomalies detected this week.",
            "pdf_url": "",
        }

    result.setdefault("pdf_url", "")
    return result