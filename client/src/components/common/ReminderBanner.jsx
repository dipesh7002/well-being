import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { http } from "../../api/http";
import { useAuth } from "../../hooks/useAuth";

function formatReminderTime(value) {
  if (!value) return "your chosen time";

  const [hours = "00", minutes = "00"] = value.split(":");
  const hourNumber = Number(hours);
  const meridiem = hourNumber >= 12 ? "PM" : "AM";
  const displayHour = hourNumber % 12 || 12;
  return `${displayHour}:${minutes} ${meridiem}`;
}

export function ReminderBanner({ onlyWhenNeeded = false }) {
  const { user } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState({
    needsAttention: false,
    reminderTime: user?.reminderTime || ""
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadReminderState() {
      if (!user?.reminderEnabled) {
        if (!isCancelled) {
          setStatus({
            needsAttention: false,
            reminderTime: ""
          });
        }
        return;
      }

      try {
        const response = await http.get("/dashboard/summary");

        if (!isCancelled) {
          setStatus({
            needsAttention: response.data.reminder.needsAttention,
            reminderTime: response.data.reminder.reminderTime || user.reminderTime || ""
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setStatus({
            needsAttention: true,
            reminderTime: user.reminderTime || ""
          });
        }
      }
    }

    function handleJournalRefresh() {
      loadReminderState();
    }

    loadReminderState();
    window.addEventListener("journal:updated", handleJournalRefresh);

    return () => {
      isCancelled = true;
      window.removeEventListener("journal:updated", handleJournalRefresh);
    };
  }, [location.pathname, user?.reminderEnabled, user?.reminderTime]);

  if (!user?.reminderEnabled) return null;
  if (onlyWhenNeeded && !status.needsAttention) return null;

  const reminderTime = formatReminderTime(status.reminderTime);

  return (
    <div
      className="surface-card rounded-[30px] border"
      style={{ borderColor: "oklch(var(--primary) / 0.35)" }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="theme-text text-sm font-semibold">Reflection reminder</p>
          <p className="theme-text-muted mt-1 text-sm leading-6">
            {status.needsAttention
              ? `Reminder set for ${reminderTime}. Save a final entry today to keep your reflection streak warm.`
              : `Reminder set for ${reminderTime}. You already completed your final journal check-in today.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" to="/app/journal/new">
            Open journal
          </Link>
          <Link className="btn-secondary" to="/app/settings">
            Adjust reminder
          </Link>
        </div>
      </div>
    </div>
  );
}

