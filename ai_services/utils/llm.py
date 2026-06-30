import os
from langchain_google_genai import ChatGoogleGenerativeAI

def get_llm(temperature: float = 0.3,  max_output_tokens: int = 4096) -> ChatGoogleGenerativeAI:
    """
    Returns a Gemini 2.5 Flash LLM instance.
    temperature = 0.1 → more focused/deterministic (used for data analysis)
    temperature = 0.4 → more creative (used for plan generation)
    """
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=temperature,
         max_output_tokens=max_output_tokens,
        # timeout=60,
    )