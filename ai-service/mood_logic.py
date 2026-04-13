from __future__ import annotations

import re
from typing import Iterable

from nltk.sentiment import SentimentIntensityAnalyzer

APP_MOODS = {"happy", "calm", "neutral", "stressed", "anxious", "sad"}

ANXIOUS_PHRASES = {
    "anxious",
    "panic",
    "panicking",
    "worried",
    "worrying",
    "uneasy",
    "nervous",
    "scared",
    "afraid",
    "fearful",
    "restless",
    "on edge",
    "racing thoughts",
    "can't stop worrying",
}

STRESSED_PHRASES = {
    "stressed",
    "stress",
    "overwhelmed",
    "burned out",
    "burnt out",
    "too much",
    "pressure",
    "deadline",
    "deadlines",
    "busy",
    "exhausted",
    "drained",
    "tired",
    "tense",
    "overloaded",
    "spread thin",
    "too much",
}

SAD_PHRASES = {
    "sad",
    "empty",
    "hopeless",
    "worthless",
    "numb",
    "lonely",
    "crying",
    "nothing matters",
    "don't like anything",
    "do not like anything",
    "everything feels same",
    "everything feels the same",
    "feel nothing",
    "feeling low",
}

CALM_PHRASES = {
    "calm",
    "peaceful",
    "steady",
    "grounded",
    "relieved",
    "okay",
    "fine",
    "lighter",
    "steadying",
}

HAPPY_PHRASES = {
    "happy",
    "joy",
    "joyful",
    "good",
    "great",
    "grateful",
    "excited",
    "hopeful",
    "smile",
    "smiled",
    "proud",
    "supported",
}

def _count_matches(text: str, phrases: Iterable[str]) -> int:
    return sum(1 for phrase in phrases if phrase in text)


def analyze_text(text: str, analyzer: SentimentIntensityAnalyzer) -> dict[str, float | str]:
    normalized = re.sub(r"\s+", " ", text.strip().lower())
    sentiment = analyzer.polarity_scores(normalized)
    compound = round(float(sentiment["compound"]), 3)

    anxious_hits = _count_matches(normalized, ANXIOUS_PHRASES)
    stressed_hits = _count_matches(normalized, STRESSED_PHRASES)
    sad_hits = _count_matches(normalized, SAD_PHRASES)
    calm_hits = _count_matches(normalized, CALM_PHRASES)
    happy_hits = _count_matches(normalized, HAPPY_PHRASES)
    low_mood_hits = anxious_hits + stressed_hits + sad_hits

    detected_mood = "neutral"

    if anxious_hits > 0 and anxious_hits >= stressed_hits:
        detected_mood = "anxious"
    elif stressed_hits > 0:
        detected_mood = "stressed"
    elif sad_hits > 0:
        detected_mood = "sad"
    elif happy_hits > 0 and happy_hits >= calm_hits:
        detected_mood = "happy" if compound >= 0.55 or happy_hits > 1 else "calm"
    elif calm_hits > 0:
        detected_mood = "calm"
    elif low_mood_hits >= 2:
        detected_mood = "stressed" if stressed_hits >= sad_hits else "sad"
    elif compound <= -0.55:
        detected_mood = "sad"
    elif compound <= -0.18:
        detected_mood = "stressed"
    elif compound >= 0.55:
        detected_mood = "happy"
    elif compound >= 0.18:
        detected_mood = "calm"

    if detected_mood not in APP_MOODS:
        detected_mood = "neutral"

    return {
        "detectedMood": detected_mood,
        "sentimentScore": compound,
        "signals": {
            "anxious": anxious_hits,
            "stressed": stressed_hits,
            "sad": sad_hits,
            "calm": calm_hits,
            "happy": happy_hits,
        },
    }
