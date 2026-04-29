from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict
from agents.anomaly_agents import run_anomaly_detection
import traceback

router = APIRouter()

class AnomalyRequest(BaseModel):
    current_session:  Dict[str, Any]       # the session just logged
    recent_sessions:  List[Dict[str, Any]] # last 10 completed sessions
    plan_context:     Dict[str, Any]       # what the plan expected


@router.post("")
async def detect_anomaly(body: AnomalyRequest):
    """
    Receives workout data from Node.js.
    Runs LangGraph 2-agent pipeline.
    Returns anomaly report.
    """
    try:
        result = run_anomaly_detection(
            current_session=body.current_session,
            recent_sessions=body.recent_sessions,
            plan_context=body.plan_context,
        )
        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))