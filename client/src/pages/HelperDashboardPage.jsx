import { useEffect, useRef, useState } from "react";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { formatFriendlyDate, getMoodMeta } from "../lib/utils";

const MOOD_STYLE = {
  happy:    { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-100" },
  calm:     { bg: "bg-teal-50",    text: "text-teal-700",   border: "border-teal-100" },
  neutral:  { bg: "bg-stone-50",   text: "text-stone-600",  border: "border-stone-200" },
  stressed: { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-100" },
  anxious:  { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-100" },
  sad:      { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-100" },
};

function UserSection({ access, draftFeedback, onDraftChange, onSubmit }) {
  const [expanded, setExpanded] = useState(true);
  const textareaRef = useRef(null);
  const entries = access.sharedEntryIds ?? [];
  const notes = access.helperFeedback ?? [];

  return (
    <div
      className="rounded-3xl border overflow-hidden"
      style={{ borderColor: "oklch(var(--line) / 0.6)" }}
    >
      {/* User header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors"
        style={{ background: "oklch(var(--surface) / 0.9)" }}
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: "oklch(var(--primary-soft))", color: "oklch(var(--primary))" }}
        >
          {access.userId?.fullName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold theme-text text-sm">{access.userId?.fullName ?? "Unknown user"}</p>
          <p className="text-xs theme-text-faint mt-0.5">
            Sharing since {formatFriendlyDate(access.consentGrantedAt)} · {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0 theme-text-faint transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4" style={{ borderTop: "1px solid oklch(var(--line) / 0.4)" }}>

          {/* Journal entries */}
          {entries.length === 0 ? (
            <p className="pt-4 text-sm theme-text-muted">No entries shared yet.</p>
          ) : (
            <div className="pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest theme-text-faint">Journal entries</p>
              {entries.map((entry) => {
                const mood = getMoodMeta(entry.finalMood);
                const style = MOOD_STYLE[entry.finalMood] ?? MOOD_STYLE.neutral;
                return (
                  <div
                    key={entry._id}
                    className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
                        style={{ border: `1px solid currentColor`, opacity: 0.9 }}
                      >
                        {mood.emoji} {mood.label}
                      </span>
                      <span className="text-xs theme-text-faint">{formatFriendlyDate(entry.entryDate)}</span>
                    </div>
                    <p className="text-sm leading-7 text-stone-700 whitespace-pre-wrap">{entry.text}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Previous notes */}
          {notes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest theme-text-faint">Your previous notes</p>
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="flex gap-3 rounded-2xl p-3"
                  style={{ background: "oklch(var(--primary-soft) / 0.4)", border: "1px solid oklch(var(--primary) / 0.15)" }}
                >
                  <div
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs"
                    style={{ background: "oklch(var(--primary-soft))", color: "oklch(var(--primary))" }}
                  >
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm theme-text leading-6">{note.message}</p>
                    {note.createdAt && (
                      <p className="mt-1 text-xs theme-text-faint">{formatFriendlyDate(note.createdAt)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback composer */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "oklch(var(--surface))", border: "1px solid oklch(var(--line) / 0.5)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest theme-text-faint">Send a supportive note</p>
            <textarea
              ref={textareaRef}
              className="input-base min-h-24 resize-none"
              value={draftFeedback[access._id] || ""}
              onChange={(e) => onDraftChange(access._id, e.target.value)}
              placeholder="Write a calm, supportive message or coping suggestion…"
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="btn-primary px-5 py-2 text-sm"
                disabled={!draftFeedback[access._id]?.trim()}
                onClick={() => onSubmit(access._id)}
              >
                Send note
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export function HelperDashboardPage() {
  const [data, setData] = useState(null);
  const [draftFeedback, setDraftFeedback] = useState({});
  const [error, setError] = useState("");

  async function loadSharedEntries() {
    try {
      const response = await http.get("/helper/shared-entries");
      setData(response.data.sharedAccess);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load messages.");
    }
  }

  useEffect(() => { loadSharedEntries(); }, []);

  function handleDraftChange(accessId, value) {
    setDraftFeedback((prev) => ({ ...prev, [accessId]: value }));
  }

  async function handleSubmit(accessId) {
    const message = draftFeedback[accessId]?.trim();
    if (!message) return;
    await http.post(`/helper/shared-access/${accessId}/feedback`, { message });
    setDraftFeedback((prev) => ({ ...prev, [accessId]: "" }));
    loadSharedEntries();
  }

  if (error) return <EmptyState title="Messages unavailable" description={error} />;

  if (!data) {
    return <Card title="Loading messages">Fetching shared entries…</Card>;
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No messages yet"
        description="When users share their journal entries with you, they will appear here. You can then read their entries and send supportive notes."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((access) => (
        <UserSection
          key={access._id}
          access={access}
          draftFeedback={draftFeedback}
          onDraftChange={handleDraftChange}
          onSubmit={handleSubmit}
        />
      ))}
    </div>
  );
}
