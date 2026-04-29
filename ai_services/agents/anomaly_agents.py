import json
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.llm import get_llm


# ─────────────────────────────────────────────────────────────────
# SHARED STATE
# This dict is passed between Agent 1 and Agent 2.
# Agent 1 fills "data_summary", Agent 2 fills "anomaly_report".
# ─────────────────────────────────────────────────────────────────
class AnomalyState(TypedDict):
    current_session:  dict
    recent_sessions:  List[dict]
    plan_context:     dict
    data_summary:     str    # filled by Agent 1
    anomaly_report:   dict   # filled by Agent 2


# ─────────────────────────────────────────────────────────────────
# AGENT 1 — DATA COLLECTOR
# Job: Look at raw workout data and write a clean summary of trends.
# Does NOT detect anomalies — just reports the facts.
# ─────────────────────────────────────────────────────────────────
DATA_COLLECTOR_PROMPT = PromptTemplate(
    input_variables=["current_session", "recent_sessions", "plan_context"],
    template="""
You are the Data Collector agent in Freeko's Anomaly Detective system.

Your ONLY job is to read the workout data and write a clear factual summary.
Do NOT detect anomalies yet. Just report what you see in the numbers.

Current workout session logged by the athlete:
{current_session}

Last 10 sessions (most recent first):
{recent_sessions}

What the plan expected this week:
{plan_context}

Write a structured summary covering:
1. Performance trend per exercise — is weight/reps going up, down, or flat?
2. Actual volume vs planned volume — over or under?
3. RPE trend — is the athlete finding workouts harder or easier over time?
4. Any muscle groups skipped or undertrained recently?
5. Session completion rate — how many planned vs completed?

Return plain text summary only. Be specific with numbers.
""",
)


def data_collector_node(state: AnomalyState) -> AnomalyState:
    """
    Agent 1 runs here.
    Takes raw data from state, produces a clean text summary.
    """
    llm    = get_llm(temperature=0.1)  # low temp = factual, no creativity
    parser = StrOutputParser()
    chain  = DATA_COLLECTOR_PROMPT | llm | parser

    summary = chain.invoke({
        "current_session":  json.dumps(state["current_session"],  default=str, indent=2),
        "recent_sessions":  json.dumps(state["recent_sessions"],  default=str, indent=2),
        "plan_context":     json.dumps(state["plan_context"],     default=str, indent=2),
    })

    # Add summary to shared state — Agent 2 will read this
    return {**state, "data_summary": summary}


# ─────────────────────────────────────────────────────────────────
# AGENT 2 — REASONER
# Job: Take Agent 1's summary and detect actual anomalies.
# Returns structured JSON with flags and suggestions.
# ─────────────────────────────────────────────────────────────────
REASONER_PROMPT = PromptTemplate(
    input_variables=["data_summary", "plan_context"],
    template="""
You are the Reasoner agent in Freeko's Anomaly Detective system.

Agent 1 has already analysed the raw data and written this summary:
{data_summary}

Plan context (what was expected):
{plan_context}

Your job is to detect training anomalies from this summary and give one clear suggestion.

Possible anomaly flags you can use:
- shoulder_fatigue
- bench_drop
- squat_drop
- deadlift_drop
- overtraining
- undertraining
- muscle_imbalance
- high_rpe_trend
- skipped_sessions
- volume_spike
- volume_drop
- no_progression

Rules:
- Only flag something if there is clear evidence in the summary.
- If nothing is wrong, set anomaly_detected to false and flags to empty list.
- suggestion must be one concrete actionable sentence for the athlete.

Return ONLY valid JSON — no explanation, no markdown:
{{
  "anomaly_detected": true,
  "flags": ["bench_drop", "shoulder_fatigue"],
  "summary": "Bench press has dropped 10kg over 3 sessions while shoulder RPE is trending high.",
  "suggestion": "Reduce pressing volume by 30% this week and add 2 sets of face pulls to address shoulder fatigue."
}}
""",
)


def reasoner_node(state: AnomalyState) -> AnomalyState:
    """
    Agent 2 runs here.
    Reads Agent 1's data_summary from state.
    Produces structured anomaly report JSON.
    """
    llm    = get_llm(temperature=0.2)
    parser = StrOutputParser()
    chain  = REASONER_PROMPT | llm | parser

    raw = chain.invoke({
        "data_summary": state["data_summary"],
        "plan_context": json.dumps(state["plan_context"], default=str, indent=2),
    })

    # Strip markdown fences if Gemini adds them
    raw = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    report = json.loads(raw)

    # Add final report to shared state
    return {**state, "anomaly_report": report}


# ─────────────────────────────────────────────────────────────────
# BUILD THE LANGGRAPH
# This defines the flow:  data_collector → reasoner → END
# ─────────────────────────────────────────────────────────────────
def build_anomaly_graph():
    graph = StateGraph(AnomalyState)

    # Register both agent nodes
    graph.add_node("data_collector", data_collector_node)
    graph.add_node("reasoner",       reasoner_node)

    # Define the flow
    graph.set_entry_point("data_collector")  # always start here
    graph.add_edge("data_collector", "reasoner")  # then go to reasoner
    graph.add_edge("reasoner", END)               # then stop

    return graph.compile()


# ─────────────────────────────────────────────────────────────────
# MAIN FUNCTION — called by the router
# ─────────────────────────────────────────────────────────────────
def run_anomaly_detection(
    current_session: dict,
    recent_sessions: list,
    plan_context: dict
) -> dict:
    """
    Entry point for anomaly detection.
    Runs the full LangGraph pipeline and returns the anomaly report.
    """
    app = build_anomaly_graph()

    result = app.invoke({
        "current_session": current_session,
        "recent_sessions": recent_sessions,
        "plan_context":    plan_context,
        "data_summary":    "",    # empty — Agent 1 will fill this
        "anomaly_report":  {},    # empty — Agent 2 will fill this
    })

    return result["anomaly_report"]