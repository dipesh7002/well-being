import { useEffect, useState } from "react";
import { http } from "../api/http";
import { MoodDistributionChart } from "../components/charts/MoodDistributionChart";
import { MoodTrendChart } from "../components/charts/MoodTrendChart";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { moodOptions } from "../data/moodMeta";

const TECHNIQUE_LABELS = {
  "478": "4-7-8 Breathing",
  "box": "Box Breathing",
  "calm": "4-6 Calm Breathing"
};

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [breathData, setBreathData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [moodRes, breathRes] = await Promise.all([
          http.get("/analytics/moods"),
          http.get("/analytics/breathing")
        ]);
        setData(moodRes.data);
        setBreathData(breathRes.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load analytics.");
      }
    }

    loadAnalytics();
  }, []);

  if (error) {
    return <EmptyState title="Analytics unavailable" description={error} />;
  }

  if (!data) {
    return <Card title="Loading analytics">Collecting your mood trends...</Card>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Daily mood trend" subtitle="Each point reflects a completed journal entry.">
          <MoodTrendChart data={data.dailyTrend} />
        </Card>
        <Card title="Mood distribution" subtitle="How your completed moods have been distributed overall.">
          <MoodDistributionChart distribution={data.distribution} />
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card title="Weekly summary" subtitle="Review total completed entries across recent weeks.">
          <div className="space-y-3">
            {data.weeklyTrend.length ? (
              data.weeklyTrend.map((week) => (
                <div key={week.week} className="rounded-[28px] bg-orange-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-stone-800">Week of {week.week}</p>
                    <span className="text-sm text-stone-500">{week.total} entries</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Weekly patterns will appear after a few completed entries.</p>
            )}
          </div>
        </Card>

        <Card title="Distribution details" subtitle="A quick count for each mood type.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {moodOptions.map((mood) => (
              <div key={mood.value} className="rounded-[28px] bg-stone-50/90 p-4">
                <p className="text-lg">{mood.emoji}</p>
                <p className="mt-2 font-semibold text-stone-800">{mood.label}</p>
                <p className="mt-1 text-sm text-stone-500">{data.distribution[mood.value] || 0} entries</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card title="Word count insight" subtitle="Simple writing-length trends across your completed reflections.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] bg-orange-50 p-4">
            <p className="text-sm text-stone-500">Latest</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{data.wordInsights.latest}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">words</p>
          </div>
          <div className="rounded-[28px] bg-amber-50 p-4">
            <p className="text-sm text-stone-500">Average</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{data.wordInsights.average}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">words</p>
          </div>
          <div className="rounded-[28px] bg-rose-50 p-4">
            <p className="text-sm text-stone-500">Longest</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{data.wordInsights.longest}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">words</p>
          </div>
          <div className="rounded-[28px] bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Trend</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-stone-900">{data.wordInsights.trend}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">
              total {data.wordInsights.totalWords} words
            </p>
          </div>
        </div>
      </Card>

      {/* Breathing Analytics */}
      {breathData && (
        breathData.totalSessions === 0 ? (
          <Card title="Breathing" subtitle="Your breathing session history will appear here.">
            <p className="text-sm text-stone-500">Complete your first session on the Breathe page to see stats.</p>
          </Card>
        ) : (
          <>
            <Card title="Breathing overview" subtitle="Stats from all your completed breathing sessions.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[28px] bg-sky-50 p-4">
                  <p className="text-sm text-stone-500">Total sessions</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">{breathData.totalSessions}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">completed</p>
                </div>
                <div className="rounded-[28px] bg-teal-50 p-4">
                  <p className="text-sm text-stone-500">Time breathed</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">{breathData.totalMinutes}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">minutes total</p>
                </div>
                <div className="rounded-[28px] bg-indigo-50 p-4">
                  <p className="text-sm text-stone-500">This week</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">{breathData.sessionsThisWeek}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">sessions</p>
                </div>
                <div className="rounded-[28px] bg-violet-50 p-4">
                  <p className="text-sm text-stone-500">Favourite</p>
                  <p className="mt-2 text-lg font-semibold leading-tight text-stone-900">{breathData.favouriteTechnique ?? "—"}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">technique</p>
                </div>
              </div>
            </Card>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card title="Technique breakdown" subtitle="How often you use each breathing method.">
                <div className="space-y-3">
                  {Object.entries(breathData.techniqueBreakdown).map(([id, count]) => {
                    const max = Math.max(...Object.values(breathData.techniqueBreakdown), 1);
                    return (
                      <div key={id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-stone-700">{TECHNIQUE_LABELS[id]}</span>
                          <span className="text-sm text-stone-500">{count} session{count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / max) * 100}%`,
                              background: "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--accent)))"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="Recent sessions" subtitle="Your last 10 completed sessions.">
                {breathData.recentSessions.length ? (
                  <div className="space-y-2">
                    {breathData.recentSessions.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-[20px] bg-stone-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-stone-800">{s.technique}</p>
                          <p className="text-xs text-stone-500">
                            {s.rounds} round{s.rounds !== 1 ? "s" : ""} · {Math.round(s.durationSeconds / 60)} min
                          </p>
                        </div>
                        <p className="text-xs text-stone-400">
                          {new Date(s.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">No sessions recorded yet.</p>
                )}
              </Card>
            </section>
          </>
        )
      )}
    </div>
  );
}

