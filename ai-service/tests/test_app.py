from __future__ import annotations

import app as app_module


class FakeAnalyzer:
    def __init__(self, compound: float = 0.68) -> None:
        self.compound = compound

    def polarity_scores(self, text: str) -> dict[str, float]:
        return {"compound": self.compound}


def test_health_endpoint_callable() -> None:
    assert app_module.health_check() == {
        "status": "ok",
        "service": "wellbeing-journal-ai",
    }


def test_analyze_endpoint_callable_returns_structured_response() -> None:
    app_module._analyzer = FakeAnalyzer(0.82)

    response = app_module.analyze(
        app_module.AnalyzeRequest(
            text="I feel grateful, calm, and excited about today.",
        )
    )

    assert response.detectedMood in {"happy", "calm"}
    assert response.sentimentScore == 0.82
    assert response.signals["happy"] >= 2
