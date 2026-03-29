from __future__ import annotations

import nltk
from fastapi import FastAPI
from pydantic import BaseModel, Field
from nltk.sentiment import SentimentIntensityAnalyzer

from mood_logic import analyze_text


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000)


class AnalyzeResponse(BaseModel):
    detectedMood: str
    sentimentScore: float
    signals: dict[str, int]


app = FastAPI(
    title="Well-Being Journal AI Service",
    description="Lightweight mood analysis API for journal text.",
    version="1.0.0",
)

_analyzer: SentimentIntensityAnalyzer | None = None


@app.on_event("startup")
def startup_event() -> None:
    global _analyzer
    nltk.download("vader_lexicon", quiet=True)
    _analyzer = SentimentIntensityAnalyzer()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "wellbeing-journal-ai"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    analyzer = _analyzer or SentimentIntensityAnalyzer()
    result = analyze_text(request.text, analyzer)
    return AnalyzeResponse(**result)

