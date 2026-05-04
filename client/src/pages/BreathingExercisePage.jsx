import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/common/Card";

const TECHNIQUES = [
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Calms the nervous system by lengthening the exhale.",
    tagline: "4s · 7s · 8s",
    phases: [
      { label: "Inhale", duration: 4, direction: "expand" },
      { label: "Hold",   duration: 7, direction: "hold" },
      { label: "Exhale", duration: 8, direction: "contract" }
    ]
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Builds focus and steadies heart rate with equal intervals.",
    tagline: "4s · 4s · 4s · 4s",
    phases: [
      { label: "Inhale", duration: 4, direction: "expand" },
      { label: "Hold",   duration: 4, direction: "hold" },
      { label: "Exhale", duration: 4, direction: "contract" },
      { label: "Hold",   duration: 4, direction: "hold" }
    ]
  },
  {
    id: "calm",
    name: "4-6 Calm Breathing",
    description: "Gently slows breathing to ease anxiety.",
    tagline: "4s · 6s",
    phases: [
      { label: "Inhale", duration: 4, direction: "expand" },
      { label: "Exhale", duration: 6, direction: "contract" }
    ]
  }
];

const ROUND_OPTIONS = [3, 5, 8];
const DEFAULT_ROUNDS = 5;

const KEYFRAME = {
  expand:   "breathe-expand",
  contract: "breathe-contract",
  hold:     "breathe-hold"
};

function getCircleAnimation(phase, status) {
  if (status === "IDLE" || status === "COMPLETE") return "none";
  return `${KEYFRAME[phase.direction]} ${phase.duration}s ease-in-out forwards`;
}

export function BreathingExercisePage() {
  const [status, setStatus]             = useState("IDLE");
  const [techniqueId, setTechniqueId]   = useState("478");
  const [targetRounds, setTargetRounds] = useState(DEFAULT_ROUNDS);
  const [phaseIndex, setPhaseIndex]     = useState(0);
  const [countdown, setCountdown]       = useState(null);
  const [cycleCount, setCycleCount]     = useState(0);

  const intervalRef = useRef(null);
  const sessionRef  = useRef({ phaseIndex: 0, cycleCount: 0, countdown: 0 });

  const technique    = TECHNIQUES.find(t => t.id === techniqueId);
  const currentPhase = technique.phases[phaseIndex];

  // Keep ref in sync with latest state to avoid stale closures inside setInterval
  sessionRef.current = { phaseIndex, cycleCount, countdown };

  useEffect(() => {
    if (status !== "RUNNING") return;
    const tech = TECHNIQUES.find(t => t.id === techniqueId);

    intervalRef.current = setInterval(() => {
      const { phaseIndex: pi, cycleCount: cc, countdown: cd } = sessionRef.current;

      if (cd > 1) {
        setCountdown(cd - 1);
        return;
      }

      const nextPi      = (pi + 1) % tech.phases.length;
      const loopDone    = nextPi === 0;
      const nextCc      = loopDone ? cc + 1 : cc;

      if (loopDone && nextCc >= targetRounds) {
        clearInterval(intervalRef.current);
        setStatus("COMPLETE");
        setCycleCount(nextCc);
        return;
      }

      setPhaseIndex(nextPi);
      setCycleCount(nextCc);
      setCountdown(tech.phases[nextPi].duration);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [status, techniqueId, targetRounds]);

  // Clear interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  function handleStart() {
    setPhaseIndex(0);
    setCycleCount(0);
    setCountdown(technique.phases[0].duration);
    setStatus("RUNNING");
  }

  function handlePause() {
    clearInterval(intervalRef.current);
    setStatus("PAUSED");
  }

  function handleResume() {
    setStatus("RUNNING");
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setStatus("IDLE");
    setPhaseIndex(0);
    setCycleCount(0);
    setCountdown(null);
  }

  function handleTechniqueSelect(id) {
    if (id === techniqueId) return;
    clearInterval(intervalRef.current);
    setTechniqueId(id);
    setStatus("IDLE");
    setPhaseIndex(0);
    setCycleCount(0);
    setCountdown(null);
  }

  function handleRoundsSelect(n) {
    setTargetRounds(n);
    handleReset();
  }

  return (
    <div className="space-y-4">

      {/* Technique selector */}
      <Card title="Choose a technique">
        <div className="grid gap-3 sm:grid-cols-3">
          {TECHNIQUES.map(tech => {
            const selected = tech.id === techniqueId;
            return (
              <button
                key={tech.id}
                type="button"
                aria-pressed={selected}
                onClick={() => handleTechniqueSelect(tech.id)}
                className="surface-panel text-left transition-all duration-200"
                style={selected
                  ? { outline: "2px solid oklch(var(--primary))", outlineOffset: "2px" }
                  : { opacity: 0.8 }
                }
              >
                <p className="theme-text text-sm font-semibold">{tech.name}</p>
                <p className="theme-text-muted mt-1 text-xs leading-5">{tech.description}</p>
                <p className="mt-2 text-xs font-semibold" style={{ color: "oklch(var(--primary))" }}>
                  {tech.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Rounds selector */}
      <Card title="Rounds">
        <div className="flex gap-2">
          {ROUND_OPTIONS.map(n => (
            <button
              key={n}
              type="button"
              className={n === targetRounds ? "btn-primary" : "btn-secondary"}
              onClick={() => handleRoundsSelect(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      {/* Exercise area */}
      <Card>
        {status === "COMPLETE" ? (
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <p className="gradient-title text-4xl">Well done!</p>
            <p className="theme-text-muted text-sm max-w-xs">
              You completed {cycleCount} round{cycleCount !== 1 ? "s" : ""} of {technique.name}.
              Take a moment to notice how you feel.
            </p>
            <div className="flex gap-3 mt-4">
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Try Again
              </button>
              <Link to="/app/dashboard" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-6">

            {/* Breathing circle */}
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 220,
                height: 220,
                background: "radial-gradient(circle, oklch(var(--primary-soft)), transparent 70%)"
              }}
            >
              <div
                key={`circle-${phaseIndex}-${status}`}
                className="rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  background: "linear-gradient(135deg, oklch(var(--primary) / 0.85), oklch(var(--accent) / 0.7))",
                  boxShadow: "0 0 40px oklch(var(--primary) / 0.3)",
                  animation: getCircleAnimation(currentPhase, status)
                }}
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center select-none"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="text-white text-sm font-semibold tracking-wide drop-shadow">
                  {status === "IDLE" ? "Ready" : currentPhase.label}
                </span>
                {countdown !== null && status !== "IDLE" && (
                  <span className="text-white text-4xl font-bold drop-shadow mt-1">
                    {countdown}
                  </span>
                )}
              </div>
            </div>

            {/* Round counter */}
            {status !== "IDLE" && (
              <p className="theme-text-muted text-sm">
                Round {Math.min(cycleCount + 1, targetRounds)} of {targetRounds}
              </p>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {status === "IDLE" && (
                <button type="button" className="btn-primary" onClick={handleStart}>
                  Start
                </button>
              )}
              {status === "RUNNING" && (
                <button type="button" className="btn-secondary" onClick={handlePause}>
                  Pause
                </button>
              )}
              {status === "PAUSED" && (
                <button type="button" className="btn-primary" onClick={handleResume}>
                  Resume
                </button>
              )}
              {(status === "RUNNING" || status === "PAUSED") && (
                <button type="button" className="btn-secondary" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>

            {/* Idle hint */}
            {status === "IDLE" && (
              <p className="theme-text-faint text-xs text-center max-w-xs">
                Select a technique and press Start. Follow the circle — breathe in as it expands, hold when it pauses, breathe out as it contracts.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
