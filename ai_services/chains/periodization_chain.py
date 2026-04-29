import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.llm import get_llm


PLAN_PROMPT = PromptTemplate(
    input_variables=["athlete_json", "total_weeks", "start_date"],
    template="""
You are an elite strength and conditioning coach AI for Freeko, a gym coaching platform.

Generate a complete {total_weeks}-week periodized training program starting from {start_date}.

Here is the athlete's profile:
{athlete_json}

Follow these rules strictly:
- Split the program into 2-4 mesocycles (training blocks).
- Each mesocycle must have a clear focus: hypertrophy, strength, power, or peak/taper.
- Each mesocycle contains multiple microcycles (one per week).
- Every 4th or 5th week must be a deload week (is_deload: true).
- Each microcycle has 3-5 workout sessions per week.
- Each session has 4-6 exercises with sets, reps, weight (default 0), rpe, and notes.
- Volume targets (sets per week per muscle group) must be progressive across weeks.
- Directly address the athlete's weaknesses and goals in the plan.

Return ONLY valid JSON — no explanation, no markdown, no extra text.
Use exactly this structure:

{{
  "prompt_used": "brief one line rationale for this plan",
  "mesocycles": [
    {{
      "order": 1,
      "name": "Hypertrophy Block",
      "focus": "muscle building",
      "week_start": 1,
      "week_end": 4,
      "total_weeks": 4,
      "intensity_level": "moderate",
      "microcycles": [
        {{
          "week_number": 1,
          "is_deload": false,
          "theme": "intro volume week",
          "volume_targets": {{
            "chest": 12,
            "back": 14,
            "legs": 16,
            "shoulders": 10,
            "arms": 8,
            "core": 6
          }},
          "sessions": [
            {{
              "day_label": "Monday - Push",
              "exercises": [
                {{
                  "name": "Bench Press",
                  "sets": 4,
                  "reps": 10,
                  "weight": 0,
                  "rpe": 7,
                  "notes": "Focus on controlled descent",
                  "completed": false
                }}
              ]
            }}
          ]
        }}
      ]
    }}
  ]
}}
""",
)


def run_periodization_chain(athlete: dict, total_weeks: int, start_date: str) -> dict:
    llm    = get_llm(temperature=0.4)
    parser = StrOutputParser()

    # LCEL pipe syntax — replaces LLMChain
    chain = PLAN_PROMPT | llm | parser

    raw = chain.invoke({
        "athlete_json": json.dumps(athlete, default=str, indent=2),
        "total_weeks":  total_weeks,
        "start_date":   start_date,
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