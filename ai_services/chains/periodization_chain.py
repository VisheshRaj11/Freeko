import json
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.llm import get_llm


PLAN_PROMPT = PromptTemplate(
    input_variables=["athlete_json", "total_weeks", "start_date"],
    # In periodization_chain.py — replace template

template="""
You are an elite strength coach AI for Freeko.

Generate a {total_weeks}-week periodized program skeleton for:
{athlete_json}

IMPORTANT: To keep response fast and concise:
- Generate mesocycles and microcycles with themes only
- For sessions, list exercise NAMES and sets/reps/rpe only
- NO long notes, NO descriptions — just the data structure
- Keep exercise names short (e.g. "Bench Press" not "Barbell Bench Press on Flat Bench")

Return ONLY valid JSON:
{{
  "prompt_used": "one line",
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
          "theme": "intro volume",
          "volume_targets": {{"chest":12,"back":14,"legs":16,"shoulders":10,"arms":8,"core":6}},
          "sessions": [
            {{
              "day_label": "Monday - Push",
              "exercises": [
                {{"name":"Bench Press","sets":4,"reps":8,"weight":0,"rpe":7,"notes":"","completed":false}},
                {{"name":"OHP","sets":3,"reps":10,"weight":0,"rpe":7,"notes":"","completed":false}},
                {{"name":"Incline DB Press","sets":3,"reps":12,"weight":0,"rpe":8,"notes":"","completed":false}},
                {{"name":"Cable Fly","sets":3,"reps":15,"weight":0,"rpe":7,"notes":"","completed":false}}
              ]
            }}
          ]
        }}
      ]
    }}
  ]
}}

Rules:
- Empty string for notes (keeps tokens low)
- weight always 0
- 3-4 exercises per session maximum
- 3-5 sessions per week maximum
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