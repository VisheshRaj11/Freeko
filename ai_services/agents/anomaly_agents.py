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

IMPORTANT: The training plan has weight = 0 for all exercises because the AI
does not know the athlete's strength levels. Weight is self-selected by the athlete
to hit the target RPE. Therefore:

- NEVER compare actual weight vs planned weight (planned is always 0, ignore it)
- DO compare actual weight vs PREVIOUS session weight (weight_change field)
- DO compare actual RPE vs planned RPE (was it harder than expected?)
- DO compare actual reps vs planned reps (did they complete all reps?)
- DO compare actual sets vs planned sets (did they skip sets?)

Current session with comparisons:
{current_session}

Last 10 sessions for trend analysis:
{recent_sessions}

Plan context:
{plan_context}

Write a structured data summary covering:
1. RPE comparison — was each exercise harder or easier than planned RPE target?
2. Weight trend — did weight go up, down, or stay same vs previous same session?
   (use weight_change field — positive = increased, negative = dropped, null = first time)
3. Rep completion — did athlete hit planned reps on each exercise?
4. Set completion — did athlete complete all planned sets?
5. Volume — total actual sets vs total planned sets
6. Skip pattern — how many recent sessions were skipped?

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

Data summary from Agent 1:
{data_summary}

Plan context:
{plan_context}

Anomaly detection rules:
- weight_change < -5kg on same exercise vs last session → flag as lift_drop
- actual_rpe > planned_rpe + 2 points → flag as high_rpe_trend
- actual_reps < planned_reps on 2+ exercises → flag as underperformance
- actual_sets < planned_sets on 2+ exercises → flag as volume_drop
- is_deload = true AND all numbers look lower → NOT an anomaly, this is correct
- 2+ skipped sessions in recent history → flag as skipped_sessions
- RPE increasing across 3+ consecutive sessions → flag as overtraining
- One muscle group volume >> others significantly → flag as muscle_imbalance

Flags available:
lift_drop, high_rpe_trend, underperformance, volume_drop, volume_spike,
skipped_sessions, overtraining, muscle_imbalance, bench_drop, squat_drop,
deadlift_drop, shoulder_fatigue

Return ONLY valid JSON:
{{
  "anomaly_detected": true or false,
  "flags": ["high_rpe_trend", "lift_drop"],
  "summary": "Bench press dropped 8kg vs last push session while RPE increased from 7 to 9.",
  "suggestion": "Consider reducing bench volume by 20% next session and check recovery."
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