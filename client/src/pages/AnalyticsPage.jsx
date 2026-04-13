import { useEffect, useState } from "react";
import { http } from "../api/http";
import { MoodDistributionChart } from "../components/charts/MoodDistributionChart";
import { MoodTrendChart } from "../components/charts/MoodTrendChart";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { moodOptions } from "../data/moodMeta";

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await http.get("/analytics/moods");
        setData(response.data);
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
    </div>
  );
}

