import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { moodOptions } from "../data/moodMeta";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";
import { formatFriendlyDate, getMoodMeta } from "../lib/utils";

const defaultFilters = {
  search: "",
  mood: "",
  from: "",
  to: ""
};

export function JournalHistoryPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [filters, setFilters] = useState(defaultFilters);
  const [entries, setEntries] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEntries(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await http.get("/journals", {
        params: {
          ...nextFilters,
          limit: 25
        }
      });

      setEntries(response.data.entries);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load journal history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    async function loadHelpers() {
      if (!user?.consentSettings?.allowHelperSharing) {
        return;
      }

      try {
        const response = await http.get("/settings/helpers");
        setHelpers(response.data.helpers);
      } catch (loadError) {
        setHelpers([]);
      }
    }

    loadHelpers();
  }, [user?.consentSettings?.allowHelperSharing]);

  async function handleDelete(entryId) {
    const confirmed = window.confirm("Delete this journal entry?");
    if (!confirmed) return;

    try {
      await http.delete(`/journals/${entryId}`);
      notify({
        type: "success",
        title: "Entry deleted",
        message: "The journal entry was removed from your history."
      });
      window.dispatchEvent(new Event("journal:updated"));
      loadEntries();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete entry.");
      notify({
        type: "error",
        title: "Unable to delete entry",
        message: deleteError.response?.data?.message || "Please try deleting this entry again."
      });
    }
  }

  async function handleShare(entryId) {
    const helperId = selectedHelpers[entryId];
    if (!helperId) return;

    try {
      await http.post(`/journals/${entryId}/share`, { helperId });
      notify({
        type: "success",
        title: "Entry shared",
        message: "The selected helper can now view this shared journal entry."
      });
    } catch (errorResponse) {
      notify({
        type: "error",
        title: "Unable to share entry",
        message: errorResponse.response?.data?.message || "Please try sharing the entry again."
      });
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Search and filter" subtitle="Find entries by text, mood, or date range.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            className="input-base xl:col-span-2"
            placeholder="Search by keyword"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <select
            className="input-base"
            value={filters.mood}
            onChange={(event) => setFilters((current) => ({ ...current, mood: event.target.value }))}
          >
            <option value="">All moods</option>
            {moodOptions.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="input-base"
            value={filters.from}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
          />
          <input
            type="date"
            className="input-base"
            value={filters.to}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={loadEntries}>
            Apply filters
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFilters(defaultFilters);
              loadEntries(defaultFilters);
            }}
          >
            Reset
          </button>
        </div>
      </Card>

      <Card title="Your entries" subtitle="Drafts and completed reflections are both shown here.">
        {loading ? <p className="text-sm text-stone-500">Loading entries...</p> : null}
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}

        {!loading && !entries.length ? (
          <EmptyState
            title="No matching entries"
            description="Try changing your filters or create a new reflection."
            action={
              <Link to="/app/journal/new" className="btn-primary">
                New entry
              </Link>
            }
          />
        ) : null}

        <div className="space-y-4">
          {entries.map((entry) => {
            const mood = getMoodMeta(entry.finalMood);
            return (
              <div key={entry._id} className="rounded-[30px] border border-stone-200 bg-white/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge-pill">
                        {mood.emoji} {mood.label}
                      </span>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
                        {entry.status}
                      </span>
                      <span className="text-sm text-stone-400">{formatFriendlyDate(entry.entryDate)}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-600">{entry.text}</p>
                  </div>

                  <div className="flex flex-col gap-3 lg:w-64">
                    <Link to={`/app/journal/${entry._id}/edit`} className="btn-secondary w-full">
                      Edit entry
                    </Link>
                    <button type="button" className="btn-secondary w-full" onClick={() => handleDelete(entry._id)}>
                      Delete
                    </button>
                    {user?.consentSettings?.allowHelperSharing && helpers.length ? (
                      <div className="space-y-2 rounded-[24px] bg-orange-50 p-3">
                        <select
                          className="input-base"
                          value={selectedHelpers[entry._id] || ""}
                          onChange={(event) =>
                            setSelectedHelpers((current) => ({
                              ...current,
                              [entry._id]: event.target.value
                            }))
                          }
                        >
                          <option value="">Share with helper...</option>
                          {helpers.map((helper) => (
                            <option key={helper._id} value={helper._id}>
                              {helper.fullName}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="btn-primary w-full" onClick={() => handleShare(entry._id)}>
                          Share entry
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
