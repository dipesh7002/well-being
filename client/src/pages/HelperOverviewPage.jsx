import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { useAuth } from "../hooks/useAuth";
import { formatFriendlyDate, getMoodMeta } from "../lib/utils";

const MOOD_BG = {
  happy:    "bg-amber-50   text-amber-700",
  calm:     "bg-teal-50    text-teal-700",
  neutral:  "bg-stone-100  text-stone-600",
  stressed: "bg-orange-50  text-orange-700",
  anxious:  "bg-yellow-50  text-yellow-700",
  sad:      "bg-blue-50    text-blue-700",
};

export function HelperOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    http.get("/helper/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load stats."));
  }, []);

  const firstName = user?.fullName?.split(" ")[0] ?? "Helper";

  if (error) {
    return (
      <Card title="Dashboard unavailable">
        <p className="text-sm theme-text-muted">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">

      {/* Welcome banner */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: "linear-gradient(135deg, oklch(var(--primary-soft) / 0.6), oklch(var(--accent-soft) / 0.4))",
          border: "1px solid oklch(var(--line) / 0.5)",
        }}
      >
        <p className="text-xs font-medium tracking-widest uppercase theme-text-faint">Support Helper</p>
        <h2 className="mt-1 text-2xl font-semibold theme-text">Welcome back, {firstName}</h2>
        <p className="mt-1 text-sm theme-text-muted">
          Here's a snapshot of the people you're supporting.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "People supported",
            value: stats?.totalUsers ?? "—",
            sub: "with active sharing",
            color: "bg-violet-50",
            textColor: "text-violet-700",
          },
          {
            label: "Entries read",
            value: stats?.totalEntries ?? "—",
            sub: "shared journal entries",
            color: "bg-sky-50",
            textColor: "text-sky-700",
          },
          {
            label: "Notes sent",
            value: stats?.totalFeedback ?? "—",
            sub: "supportive messages",
            color: "bg-emerald-50",
            textColor: "text-emerald-700",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.color}`}>
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${s.textColor}`}>{s.value}</p>
            <p className="mt-1 text-xs text-stone-400 uppercase tracking-widest">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent entries */}
      <Card
        title="Recent entries"
        subtitle="Latest journal entries shared with you, across all users."
      >
        {!stats ? (
          <p className="text-sm theme-text-muted">Loading…</p>
        ) : stats.recentEntries.length === 0 ? (
          <p className="text-sm theme-text-muted">
            No entries yet. Users will appear here once they share entries with you.
          </p>
        ) : (
          <div className="space-y-3">
            {stats.recentEntries.map((entry) => {
              const mood = getMoodMeta(entry.finalMood);
              const colorClass = MOOD_BG[entry.finalMood] ?? MOOD_BG.neutral;
              return (
                <div
                  key={entry._id}
                  className="flex items-start gap-4 rounded-2xl border p-4"
                  style={{ borderColor: "oklch(var(--line) / 0.5)", background: "oklch(var(--surface) / 0.6)" }}
                >
                  {/* Avatar initial */}
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: "oklch(var(--primary-soft))", color: "oklch(var(--primary))" }}
                  >
                    {entry.userName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold theme-text">{entry.userName}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                        {mood.emoji} {mood.label}
                      </span>
                      <span className="text-xs theme-text-faint ml-auto">{formatFriendlyDate(entry.entryDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link
              to="/app/helper"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: "oklch(var(--primary))" }}
            >
              View all messages →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
