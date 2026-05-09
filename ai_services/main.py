from fastapi import FastAPI
from dotenv import load_dotenv
from routers import plan_router 
from routers import anomaly_router 
from routers import summary_router 

load_dotenv()

app = FastAPI(
    title="Freeko AI Service",
    description="LangChain + Gemini AI backend for Freeko gym coaching platform",
    version="1.0.0"
)

app.include_router(
    plan_router.router,
    prefix="/generate-plan",
    tags=["Periodization Architect"]
)

app.include_router(
    anomaly_router.router,
    prefix="/detect-anomaly",
    tags=["Anomaly Detective"]
)


app.include_router(
    summary_router.router,
    prefix="/summarize-week",
    tags=["Coach-Athlete Summarizer"]
)

@app.get("/")
def health():
    return {"status": "Freeko AI Service running 🤖"}