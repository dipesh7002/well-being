import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { getMoodMeta, formatFriendlyDate } from "../lib/utils";

export function FeedbackPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get("/journals/feedback")
      .then((res) => setRecords(res.data.feedback))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Card title="Loading feedback">Fetching helper notes...</Card>;
  }

  if (!records.length) {
    return (
      <EmptyState
        title="No feedback yet"
        description="Once a helper leaves a note on a shared entry, it will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {records.map((record) => (
        <Card
          key={record._id}
          title={`From ${record.helperId?.fullName ?? "Helper"}`}
          subtitle="Shared entries and their supportive notes."
        >
          <div className="space-y-5">
            {record.sharedEntryIds?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.24em] theme-text-faint mb-3">Shared entries</p>
                <div className="space-y-2">
                  {record.sharedEntryIds.map((entry) => {
                    if (!entry?._id) return null;
                    const mood = getMoodMeta(entry.finalMood);
                    return (
                      <div
                        key={entry._id}
                        className="rounded-[24px] px-4 py-3"
                        style={{ background: "oklch(var(--line) / 0.3)" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge-pill text-xs">{mood.emoji} {mood.label}</span>
                          <span className="text-xs theme-text-faint">{formatFriendlyDate(entry.entryDate)}</span>
                        </div>
                        <p className="text-sm theme-text-muted leading-6 line-clamp-2">{entry.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-[0.24em] theme-text-faint mb-3">Helper notes</p>
              <div className="space-y-2">
                {record.helperFeedback.map((fb) => (
                  <div
                    key={fb._id}
                    className="rounded-[24px] p-4"
                    style={{ background: "oklch(var(--primary-soft))" }}
                  >
                    <p className="text-sm theme-text leading-6">{fb.message}</p>
                    <p className="mt-2 text-xs theme-text-faint">
                      {new Date(fb.createdAt).toLocaleDateString(undefined, {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
