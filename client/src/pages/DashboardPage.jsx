import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { MoodDistributionChart } from "../components/charts/MoodDistributionChart";
import { MoodTrendChart } from "../components/charts/MoodTrendChart";
import { formatFriendlyDate, getMoodMeta } from "../lib/utils";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await http.get("/dashboard/summary");
        setData(response.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load dashboard.");
      }
    }

    loadSummary();
  }, []);

  if (error) {
    return <EmptyState title="Dashboard unavailable" description={error} />;
  }

  if (!data) {
    return <LoadingScreen label="Preparing your dashboard..." />;
  }

  const mood = getMoodMeta(data.moodOverview.recentMood || "neutral");
  const wordTrendLabel = {
    up: "upward",
    down: "downward",
    steady: "steady"
  }[data.wordInsight.trend || "steady"];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-gradient-to-br from-orange-50 via-white to-rose-50">
          <p className="text-sm text-stone-500">Hello, {data.greetingName}</p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-900">
            {data.todayJournaled ? "You’ve checked in today." : "A few quiet minutes could help today."}
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Keep your entries private, build your reflection streak, and notice how your emotional rhythm shifts over time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/journal/new" className="btn-primary">
              Write today’s entry
            </Link>
            <Link to="/app/history" className="btn-secondary">
              View history
            </Link>
          </div>
        </Card>
        <Card title="Current pulse" subtitle="Your most recent completed mood snapshot">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl">
              {mood.emoji}
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-800">{mood.label}</p>
              <p className="text-sm text-stone-500">
                {data.reminder.needsAttention
                  ? `Reminder enabled for ${data.reminder.reminderTime}`
                  : "You’ve already completed a journal check-in today."}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] bg-orange-50 p-4">
              <p className="text-sm text-stone-500">Current streak</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{data.currentStreak} days</p>
            </div>
            <div className="rounded-[28px] bg-amber-50 p-4">
              <p className="text-sm text-stone-500">Badges earned</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{data.badges.length}</p>
            </div>
            <div className="rounded-[28px] bg-rose-50 p-4">
              <p className="text-sm text-stone-500">Recent entries</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{data.recentEntries.length}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Guided prompt" subtitle="A gentle place to begin if the page feels blank.">
          <p className="rounded-[28px] bg-orange-50 p-5 text-lg font-medium leading-8 text-stone-800">
            {data.guidedPrompt?.text}
          </p>
        </Card>
        <Card title="Self-care suggestion" subtitle="Supportive ideas based on your recent mood.">
          <div className="rounded-[28px] bg-rose-50 p-5">
            <h3 className="text-lg font-semibold text-stone-800">{data.selfCareSuggestion.title}</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">{data.selfCareSuggestion.description}</p>
            {data.selfCareSuggestion.reason ? (
              <p className="mt-3 text-sm font-medium text-stone-500">
                Why this suggestion: {data.selfCareSuggestion.reason}
              </p>
            ) : null}
            {data.selfCareSuggestion.resourceLink ? (
              <a
                className="mt-4 inline-flex text-sm font-semibold text-orange-600"
                href={data.selfCareSuggestion.resourceLink}
                target="_blank"
                rel="noreferrer"
              >
                View resource
              </a>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr_0.9fr]">
        <Card title="Mood trend" subtitle="How your completed entries have shifted recently.">
          <MoodTrendChart data={data.analyticsPreview.dailyTrend} />
        </Card>
        <Card title="Mood distribution" subtitle="A summary of your completed moods so far.">
          <MoodDistributionChart distribution={data.moodOverview.distribution} />
        </Card>
        <Card title="Word count insight" subtitle="A simple reflection on how much you’ve been writing.">
          <div className="grid gap-3">
            <div className="rounded-[24px] bg-orange-50 p-4">
              <p className="text-sm text-stone-500">Latest entry</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{data.wordInsight.latest} words</p>
            </div>
            <div className="rounded-[24px] bg-amber-50 p-4">
              <p className="text-sm text-stone-500">Recent average</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{data.wordInsight.recentAverage} words</p>
            </div>
            <p className="text-sm leading-7 text-stone-500">
              Your writing volume is trending <span className="font-semibold text-stone-700">{wordTrendLabel}</span>,
              with an average of {data.wordInsight.average} words and a longest recent entry of {data.wordInsight.longest} words.
            </p>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card title="Badges" subtitle="Gentle rewards for staying consistent.">
          {data.badges.length ? (
            <div className="flex flex-wrap gap-3">
              {data.badges.map((badge) => (
                <div key={badge.slug} className="rounded-[28px] bg-orange-50 px-4 py-3">
                  <p className="font-semibold text-stone-800">{badge.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Badges will appear here"
              description="Your first streak milestone unlocks after 7 completed journaling days."
            />
          )}
        </Card>
        <Card title="Recent entries" subtitle="Your latest reflections, drafts, and completed notes.">
          {data.recentEntries.length ? (
            <div className="space-y-3">
              {data.recentEntries.map((entry) => {
                const entryMood = getMoodMeta(entry.finalMood);
                return (
                  <div key={entry._id} className="rounded-[28px] bg-stone-50/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">
                          {entryMood.emoji} {entryMood.label}
                          <span className="ml-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-stone-500">
                            {entry.status}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-stone-400">{formatFriendlyDate(entry.entryDate)}</p>
                      </div>
                      <Link className="text-sm font-semibold text-orange-600" to={`/app/journal/${entry._id}/edit`}>
                        Edit
                      </Link>
                    </div>
                    <p className="mt-3 max-h-24 overflow-hidden text-sm leading-7 text-stone-600">{entry.text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No entries yet"
              description="Your first reflection will appear here once you start journaling."
              action={
                <Link to="/app/journal/new" className="btn-primary">
                  Start journaling
                </Link>
              }
            />
          )}
        </Card>
      </section>
    </div>
  );
}
