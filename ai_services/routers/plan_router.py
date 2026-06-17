from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from chains.periodization_chain import run_periodization_chain
import traceback


router = APIRouter()


# ── Request body shape (Pydantic validates this automatically) ─────────────
class AthleteInput(BaseModel):
    fitnessLevel:    str                  # "beginner" | "intermediate" | "advanced"
    goals:           List[str]            # ["build muscle", "lose fat"]
    weaknesses:      List[str]            # ["lower back", "rear delts"]
    competitionDate: Optional[str] = None # "2025-06-01"
    weight:          Optional[float] = None
    height:          Optional[float] = None


class PlanRequest(BaseModel):
    athlete:    AthleteInput
    totalWeeks: int    # 12, 14, or 16
    startDate:  str    # "2025-01-01"


# ── POST /generate-plan ────────────────────────────────────────────────────
@router.post("")
async def generate_plan(body: PlanRequest):
    """
    Receives athlete profile + plan config from Node.js.
    Calls Gemini via LangChain to generate a full periodized plan.
    Returns the plan as JSON back to Node.js.
    """
    try:
        # print(body)
        result = run_periodization_chain(
            athlete=body.athlete.model_dump(),
            total_weeks=body.totalWeeks,
            start_date=body.startDate,
        )
        return result

    except Exception as e:
        print(str(e))

        traceback.print_exc()

        raise HTTPException(status_code=500, detail=str(e))