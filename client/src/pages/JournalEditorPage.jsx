import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { moodOptions } from "../data/moodMeta";
import { formatDateInput, getMoodMeta } from "../lib/utils";

const initialForm = {
  entryDate: formatDateInput(new Date()),
  text: "",
  manualMood: "neutral",
  finalMood: "neutral",
  promptUsed: "",
  status: "final"
};

export function JournalEditorPage() {
  const { id } = useParams();
  const [currentEntryId, setCurrentEntryId] = useState(id || null);
  const [form, setForm] = useState(initialForm);
  const [helper, setHelper] = useState({
    loading: true,
    prompt: "",
    error: ""
  });
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentEntryId(id || null);
  }, [id]);

  useEffect(() => {
    async function loadEditor() {
      try {
        const requests = [http.get("/dashboard/summary")];

        if (currentEntryId) {
          requests.push(http.get(`/journals/${currentEntryId}`));
        }

        const responses = await Promise.all(requests);
        const summary = responses[0].data;
        const existingEntry = responses[1]?.data?.entry;

        setHelper({
          loading: false,
          prompt: existingEntry?.promptUsed || summary.guidedPrompt?.text || "",
          error: ""
        });

        if (existingEntry) {
          setForm({
            entryDate: formatDateInput(existingEntry.entryDate),
            text: existingEntry.text,
            manualMood: existingEntry.manualMood,
            finalMood: existingEntry.finalMood,
            promptUsed: existingEntry.promptUsed || summary.guidedPrompt?.text || "",
            status: existingEntry.status || "final"
          });
        } else {
          setForm((current) => ({
            ...current,
            promptUsed: summary.guidedPrompt?.text || current.promptUsed
          }));
        }
      } catch (error) {
        setHelper({
          loading: false,
          prompt: "",
          error: error.response?.data?.message || "Unable to load the journal editor."
        });
      }
    }

    loadEditor();
  }, [currentEntryId]);

  async function handleSubmit(status) {
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        ...form,
        finalMood: form.manualMood,
        status
      };

      const response = currentEntryId
        ? await http.put(`/journals/${currentEntryId}`, payload)
        : await http.post("/journals", payload);

      if (!currentEntryId && response.data.entry?._id) {
        setCurrentEntryId(response.data.entry._id);
      }

      setForm((current) => ({
        ...current,
        status,
        finalMood: response.data.entry.finalMood
      }));
      setFeedback(response.data);
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Unable to save your journal entry."
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (helper.loading) {
    return <Card title="Loading editor">Preparing your journaling space...</Card>;
  }

  return (
    <div className="space-y-4">
      <Card
        title={currentEntryId ? "Edit journal entry" : "Write a new entry"}
        subtitle="Use your own mood selection as the final mood, even when AI suggestions are available."
      >
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Entry date</span>
            <input
              type="date"
              className="input-base"
              value={form.entryDate}
              onChange={(event) => setForm((current) => ({ ...current, entryDate: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Prompt</span>
            <input
              type="text"
              className="input-base"
              value={form.promptUsed}
              onChange={(event) => setForm((current) => ({ ...current, promptUsed: event.target.value }))}
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-stone-700">How are you feeling?</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setForm((current) => ({ ...current, manualMood: mood.value, finalMood: mood.value }))}
                className={[
                  "rounded-[28px] border px-4 py-4 text-left transition-colors",
                  form.manualMood === mood.value
                    ? "border-orange-300 bg-orange-50"
                    : "border-stone-200 bg-white hover:border-orange-200"
                ].join(" ")}
              >
                <p className="text-xl">{mood.emoji}</p>
                <p className="mt-2 font-semibold text-stone-800">{mood.label}</p>
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Journal text</span>
          <textarea
            className="input-base min-h-[280px] resize-y"
            value={form.text}
            onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
            placeholder="Write about your thoughts, feelings, stressors, or small moments that mattered today."
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSubmit("final")}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save final entry"}
          </button>
        </div>
      </Card>

      {helper.error ? (
        <Card title="Editor note">
          <p className="text-sm text-rose-500">{helper.error}</p>
        </Card>
      ) : null}

      {feedback ? (
        <Card title={feedback.error ? "Unable to save" : "Entry saved"} subtitle="Supportive feedback appears after saving.">
          {feedback.error ? <p className="text-sm text-rose-500">{feedback.error}</p> : null}
          {!feedback.error ? (
            <div className="space-y-4">
              <div className="rounded-[28px] bg-orange-50 p-4">
                <p className="text-sm font-semibold text-stone-700">Saved as {feedback.entry.status}</p>
                <p className="mt-2 text-sm text-stone-500">
                  Final mood: {getMoodMeta(feedback.entry.finalMood).emoji} {getMoodMeta(feedback.entry.finalMood).label}
                </p>
                {feedback.entry.detectedMood ? (
                  <p className="mt-2 text-sm text-stone-500">
                    AI suggestion: {getMoodMeta(feedback.entry.detectedMood).emoji} {getMoodMeta(feedback.entry.detectedMood).label}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-stone-500">AI mood suggestion is currently disabled or unavailable.</p>
                )}
              </div>

              <div className="rounded-[28px] bg-rose-50 p-4">
                <h3 className="font-semibold text-stone-800">{feedback.suggestion.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{feedback.suggestion.description}</p>
              </div>

              {feedback.distressSupport ? (
                <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold text-stone-800">{feedback.distressSupport.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600">{feedback.distressSupport.message}</p>
                  <a
                    className="mt-3 inline-flex text-sm font-semibold text-orange-600"
                    href={feedback.distressSupport.resourceLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View support resources
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
