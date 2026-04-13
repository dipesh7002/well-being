import { useNotification } from "../../hooks/useNotification";

const toneMap = {
  success: {
    wrapper: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-900",
    body: "text-emerald-700"
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50",
    title: "text-rose-900",
    body: "text-rose-700"
  },
  info: {
    wrapper: "border-orange-200 bg-orange-50",
    title: "text-stone-900",
    body: "text-stone-600"
  }
};

export function NotificationBar() {
  const { notifications, dismiss } = useNotification();

  if (!notifications.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const tone = toneMap[notification.type] || toneMap.info;

        return (
          <div
            key={notification.id}
            className={`rounded-[28px] border px-4 py-4 shadow-soft ${tone.wrapper}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${tone.title}`}>{notification.title}</p>
                {notification.message ? (
                  <p className={`mt-1 text-sm leading-6 ${tone.body}`}>{notification.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-stone-500 transition-colors hover:text-stone-800"
                onClick={() => dismiss(notification.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

