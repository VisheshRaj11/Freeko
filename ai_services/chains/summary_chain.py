import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.llm import get_llm


# ── Prompt Template ────────────────────────────────────────────────────────
SUMMARY_PROMPT = PromptTemplate(
    input_variables=["week_number", "chat_messages", "workout_sessions"],
    template="""
You are the weekly review AI for Freeko, an AI gym coaching platform.

Your job is to read the coach-athlete conversation and workout data from this week
and produce a clean structured weekly report.

Week Number: {week_number}

Coach-Athlete conversation this week:
{chat_messages}

Workout sessions completed this week:
{workout_sessions}

Instructions:
- Read all chat messages and identify key decisions, concerns, feedback, and plans discussed.
- Read all workout sessions and identify performance highlights, missed sessions, and progress.
- Combine both into a unified weekly picture.
- Summary bullets must be specific — mention exercise names, weights, dates where relevant.
- Anomaly insights should flag anything concerning from both chat and workouts.
- If there were no anomalies, say "No anomalies detected this week."

Return ONLY valid JSON — no markdown, no explanation:
{{
  "summary_bullets": [
    "Athlete completed 4 out of 5 planned sessions this week.",
    "Bench press progressed from 80kg to 85kg on Wednesday session.",
    "Coach adjusted squat volume after athlete reported knee discomfort on Tuesday.",
    "Athlete hit all volume targets for chest and back muscle groups.",
    "Deload week scheduled for next week — coach confirmed in chat on Friday."
  ],
  "anomaly_insights": "Athlete reported knee discomfort mid-week which was flagged by the anomaly system on Thursday's leg session. Coach proactively reduced squat volume and replaced heavy leg press with lighter leg extension work. Monitor knee health closely in the coming week before resuming full leg volume.",
  "pdf_url": ""
}}
""",
)


# ── Main function called by the router ────────────────────────────────────
def run_summary_chain(
    week_number:      int,
    chat_messages:    list,
    workout_sessions: list,
) -> dict:
    """
    Takes week number, chat messages, and workout sessions.
    Returns structured weekly report as a Python dict.
    """
    llm    = get_llm(temperature=0.3)
    parser = StrOutputParser()

    # LCEL pipe — same pattern as Feature 1
    chain = SUMMARY_PROMPT | llm | parser

    raw = chain.invoke({
        "week_number":      week_number,
        "chat_messages":    json.dumps(chat_messages,    default=str, indent=2),
        "workout_sessions": json.dumps(workout_sessions, default=str, indent=2),
    })

    # Strip markdown fences if Gemini adds them
    raw = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    return json.loads(raw)