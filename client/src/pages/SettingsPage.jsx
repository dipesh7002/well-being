import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";

const themeChoices = [
  { value: "sunrise", label: "Sunrise" },
  { value: "soft-peach", label: "Soft Peach" },
  { value: "rose-glow", label: "Rose Glow" }
];

export function SettingsPage() {
  const { updateUser, user } = useAuth();
  const { notify } = useNotification();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await http.get("/settings");
        const settings = response.data.settings;
        setForm({
          fullName: settings.fullName,
          themePreference: settings.themePreference,
          reminderEnabled: settings.reminderEnabled,
          reminderTime: settings.reminderTime,
          allowHelperSharing: settings.consentSettings?.allowHelperSharing || false,
          shareMoodSummaries: settings.consentSettings?.shareMoodSummaries || false
        });
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load settings.");
      }
    }

    loadSettings();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await http.put("/settings", form);
      setMessage(response.data.message);
      notify({
        type: "success",
        title: "Settings updated",
        message: "Your reminder, sharing, and theme preferences were saved."
      });
      updateUser({
        ...user,
        fullName: response.data.settings.fullName,
        themePreference: response.data.settings.themePreference,
        reminderEnabled: response.data.settings.reminderEnabled,
        reminderTime: response.data.settings.reminderTime,
        consentSettings: response.data.settings.consentSettings
      });
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || "Unable to update settings.");
      notify({
        type: "error",
        title: "Unable to update settings",
        message: submissionError.response?.data?.message || "Please try saving your settings again."
      });
    }
  }

  if (error && !form) {
    return <Card title="Settings unavailable">{error}</Card>;
  }

  if (!form) {
    return <Card title="Loading settings">Preparing your preferences...</Card>;
  }

  return (
    <div className="space-y-4">
      <Card title="Preferences" subtitle="Personalize the tone, reminders, and sharing controls for your journaling space.">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Full name</span>
            <input
              className="input-base"
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Theme</span>
            <select
              className="input-base"
              value={form.themePreference}
              onChange={(event) => setForm((current) => ({ ...current, themePreference: event.target.value }))}
            >
              {themeChoices.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-[28px] border border-stone-200 bg-white px-4 py-4">
              <span>
                <span className="block font-medium text-stone-800">Enable reminders</span>
                <span className="text-sm text-stone-500">In-app reminder state on your dashboard.</span>
              </span>
              <input
                type="checkbox"
                checked={form.reminderEnabled}
                onChange={(event) => setForm((current) => ({ ...current, reminderEnabled: event.target.checked }))}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Reminder time</span>
              <input
                type="time"
                className="input-base"
                value={form.reminderTime}
                onChange={(event) => setForm((current) => ({ ...current, reminderTime: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-[28px] border border-stone-200 bg-white px-4 py-4">
              <span>
                <span className="block font-medium text-stone-800">Allow helper sharing</span>
                <span className="text-sm text-stone-500">Enable explicit sharing of selected entries only.</span>
              </span>
              <input
                type="checkbox"
                checked={form.allowHelperSharing}
                onChange={(event) =>
                  setForm((current) => ({ ...current, allowHelperSharing: event.target.checked }))
                }
              />
            </label>
            <label className="flex items-center justify-between rounded-[28px] border border-stone-200 bg-white px-4 py-4">
              <span>
                <span className="block font-medium text-stone-800">Share mood summaries</span>
                <span className="text-sm text-stone-500">Allow helpers to view shared-entry mood context.</span>
              </span>
              <input
                type="checkbox"
                checked={form.shareMoodSummaries}
                onChange={(event) =>
                  setForm((current) => ({ ...current, shareMoodSummaries: event.target.checked }))
                }
              />
            </label>
          </div>

          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}

          <button type="submit" className="btn-primary w-full sm:w-fit">
            Save settings
          </button>
        </form>
      </Card>
    </div>
  );
}
