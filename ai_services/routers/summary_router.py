from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict
from chains.summary_chain import run_summary_chain
import traceback

router = APIRouter()

class SummaryRequest(BaseModel):
    plan_id:          str
    athlete_id:       str
    week_number:      int
    chat_messages:    List[Dict[str, Any]]   # messages from this week
    workout_sessions: List[Dict[str, Any]]  

@router.post("")
async def summarize_week(body: SummaryRequest):
    """
    Receives chat messages + workout sessions from Node.js.
    Runs LangChain summarization chain.
    Returns structured weekly report.
    """
    try:
        result = run_summary_chain(
            week_number=body.week_number,
            chat_messages=body.chat_messages,
            workout_sessions=body.workout_sessions,
        )
        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))