from __future__ import annotations

from mood_logic import analyze_text


class FakeAnalyzer:
    def __init__(self, compound: float) -> None:
        self.compound = compound

    def polarity_scores(self, text: str) -> dict[str, float]:
        return {"compound": self.compound}


def test_analyze_text_prioritizes_anxious_language() -> None:
    result = analyze_text(
        "I feel anxious and I cannot slow my racing thoughts tonight.",
        FakeAnalyzer(0.1),
    )

    assert result["detectedMood"] == "anxious"
    assert result["signals"]["anxious"] >= 2


def test_analyze_text_uses_phrase_hits_before_sentiment() -> None:
    result = analyze_text(
        "I feel burned out, tense, and under a lot of deadline pressure.",
        FakeAnalyzer(0.8),
    )

    assert result["detectedMood"] == "stressed"
    assert result["signals"]["stressed"] >= 3


def test_analyze_text_falls_back_to_sentiment_when_no_keywords_match() -> None:
    positive = analyze_text("Today felt spacious and easier to carry.", FakeAnalyzer(0.72))
    negative = analyze_text("Today felt sharp and difficult to carry.", FakeAnalyzer(-0.61))

    assert positive["detectedMood"] == "happy"
    assert negative["detectedMood"] == "sad"


def test_analyze_text_prefers_calm_for_steady_language() -> None:
    result = analyze_text(
        "I feel grounded, steady, and peaceful after slowing down this evening.",
        FakeAnalyzer(0.24),
    )

    assert result["detectedMood"] == "calm"
    assert result["signals"]["calm"] >= 2
