import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { formatFriendlyDate, getMoodMeta } from "../lib/utils";

export function HelperDashboardPage() {
  const [data, setData] = useState(null);
  const [draftFeedback, setDraftFeedback] = useState({});
  const [error, setError] = useState("");

  async function loadSharedEntries() {
    try {
      const response = await http.get("/helper/shared-entries");
      setData(response.data.sharedAccess);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load shared journal entries.");
    }
  }

  useEffect(() => {
    loadSharedEntries();
  }, []);

  async function submitFeedback(accessId) {
    const message = draftFeedback[accessId];
    if (!message) return;

    await http.post(`/helper/shared-access/${accessId}/feedback`, { message });
    setDraftFeedback((current) => ({ ...current, [accessId]: "" }));
    loadSharedEntries();
  }

  if (error) {
    return <EmptyState title="Helper dashboard unavailable" description={error} />;
  }

  if (!data) {
    return <Card title="Loading helper dashboard">Checking for user-shared entries...</Card>;
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No shared entries yet"
        description="When users explicitly share entries with you, they will appear here together with their mood summaries."
      />
    );
  }

  return (
    <div className="space-y-4">
      {data.map((access) => (
        <Card
          key={access._id}
          title={access.userId?.fullName || "Shared journal access"}
          subtitle={`Consent granted on ${formatFriendlyDate(access.consentGrantedAt)}`}
        >
          <div className="space-y-4">
            {access.sharedEntryIds?.map((entry) => {
              const mood = getMoodMeta(entry.finalMood);
              return (
                <div key={entry._id} className="rounded-[28px] bg-orange-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-pill">
                      {mood.emoji} {mood.label}
                    </span>
                    <span className="text-sm text-stone-400">{formatFriendlyDate(entry.entryDate)}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">{entry.text}</p>
                </div>
              );
            })}

            <div className="rounded-[28px] bg-white p-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Supportive feedback</span>
                <textarea
                  className="input-base min-h-28"
                  value={draftFeedback[access._id] || ""}
                  onChange={(event) =>
                    setDraftFeedback((current) => ({
                      ...current,
                      [access._id]: event.target.value
                    }))
                  }
                  placeholder="Add a calm, supportive note or coping suggestion."
                />
              </label>
              <button type="button" className="btn-primary mt-4" onClick={() => submitFeedback(access._id)}>
                Save feedback
              </button>
            </div>

            {access.helperFeedback?.length ? (
              <div className="space-y-2">
                {access.helperFeedback.map((note) => (
                  <div key={note._id} className="rounded-[24px] bg-rose-50 p-3">
                    <p className="text-sm text-stone-600">{note.message}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

