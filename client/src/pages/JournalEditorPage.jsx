import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { moodOptions } from "../data/moodMeta";
import { useNotification } from "../hooks/useNotification";
import { countWords, formatDateInput, getMoodMeta } from "../lib/utils";

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
  const { notify } = useNotification();
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

  const liveWordCount = countWords(form.text);
  const feedbackWordCount = feedback?.entry?.wordCount ?? liveWordCount;

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
      notify({
        type: "success",
        title: "Entry saved",
        message:
          status === "draft"
            ? "Your draft is saved and ready for you to return to."
            : "Your journal entry was saved and your insights have been refreshed."
      });
      window.dispatchEvent(new Event("journal:updated"));
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Unable to save your journal entry."
      });
      notify({
        type: "error",
        title: "Unable to save entry",
        message: error.response?.data?.message || "Please try saving your journal entry again."
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="block text-sm font-medium text-stone-700">Journal text</span>
            <span className="text-sm text-stone-500">{liveWordCount} words</span>
          </div>
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
                <p className="mt-2 text-sm text-stone-500">Word count: {feedbackWordCount} words</p>
                {feedback.entry.detectedMood ? (
                  <p className="mt-2 text-sm text-stone-500">
                    AI suggestion: {getMoodMeta(feedback.entry.detectedMood).emoji} {getMoodMeta(feedback.entry.detectedMood).label}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-stone-500">AI mood suggestion is currently disabled or unavailable.</p>
                )}
              </div>

              <div className="rounded-[28px] bg-stone-50 p-4">
                <h3 className="font-semibold text-stone-800">AI emotion analysis</h3>
                {feedback.entry.analysisSource === "off" || !feedback.entry.detectedMood ? (
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    AI analysis is turned off right now. Enable the internal or pretrained Python analyzer to see
                    detected mood signals here.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-stone-500">
                      Source:{" "}
                      <span className="font-semibold text-stone-700">
                        {feedback.entry.analysisSource === "python"
                          ? "Pretrained VADER analysis"
                          : "Rule-based fallback analysis"}
                      </span>
                    </p>
                    <p className="text-sm text-stone-500">
                      Detected mood: {getMoodMeta(feedback.entry.detectedMood).emoji}{" "}
                      {getMoodMeta(feedback.entry.detectedMood).label}
                    </p>
                    <p className="text-sm text-stone-500">
                      Sentiment score:{" "}
                      <span className="font-semibold text-stone-700">
                        {typeof feedback.entry.sentimentScore === "number"
                          ? `${feedback.entry.sentimentScore >= 0 ? "+" : ""}${feedback.entry.sentimentScore}`
                          : "Not available"}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(feedback.entry.emotionSignals || {})
                        .filter(([, value]) => value > 0)
                        .map(([signal, value]) => (
                          <span key={signal} className="badge-pill">
                            {signal} x{value}
                          </span>
                        ))}
                      {!Object.values(feedback.entry.emotionSignals || {}).some((value) => value > 0) ? (
                        <span className="text-sm text-stone-500">
                          No strong phrase hits were found, so the model leaned on the overall sentiment score.
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] bg-rose-50 p-4">
                <h3 className="font-semibold text-stone-800">{feedback.suggestion.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{feedback.suggestion.description}</p>
                {feedback.suggestion.reason ? (
                  <p className="mt-3 text-sm font-medium text-stone-500">
                    Why this suggestion: {feedback.suggestion.reason}
                  </p>
                ) : null}
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
