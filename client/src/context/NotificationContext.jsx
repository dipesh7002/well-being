import { createContext, useEffect, useRef, useState } from "react";

export const NotificationContext = createContext({
  notifications: [],
  notify() {},
  dismiss() {}
});

let notificationSequence = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timeoutMap = useRef(new Map());

  useEffect(
    () => () => {
      timeoutMap.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutMap.current.clear();
    },
    []
  );

  function dismiss(id) {
    const timeoutId = timeoutMap.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMap.current.delete(id);
    }

    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }

  function notify({ title, message = "", type = "info", duration = 4200 }) {
    const id = `notice-${notificationSequence++}`;
    setNotifications((current) => [...current, { id, title, message, type }]);

    if (duration > 0) {
      const timeoutId = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timeoutMap.current.set(id, timeoutId);
    }

    return id;
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notify,
        dismiss
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

