import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { http } from "../../api/http";
import { useAuth } from "../../hooks/useAuth";
import { NotificationBar } from "../common/NotificationBar";

const navigationByRole = {
  user: [
    { label: "Dashboard", to: "/app/dashboard" },
    { label: "New Entry", to: "/app/journal/new" },
    { label: "History", to: "/app/history" },
    { label: "Analytics", to: "/app/analytics" },
    { label: "Breathe", to: "/app/breathe" },
    { label: "Settings", to: "/app/settings" }
  ],
  admin: [
    { label: "Admin", to: "/app/admin" },
    { label: "Settings", to: "/app/settings" }
  ],
  helper: [
    { label: "Dashboard", to: "/app/dashboard" },
    { label: "Helper", to: "/app/helper" },
    { label: "Settings", to: "/app/settings" }
  ]
};

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigation = navigationByRole[user?.role] || navigationByRole.user;
  const [needsJournal, setNeedsJournal] = useState(false);

  useEffect(() => {
    if (!user?.reminderEnabled) return;
    http.get("/dashboard/summary")
      .then(res => setNeedsJournal(res.data.reminder.needsAttention))
      .catch(() => {});
  }, [location.pathname, user?.reminderEnabled]);

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="surface-card overflow-hidden bg-hero-glow lg:w-72 lg:min-w-72 lg:max-w-72 lg:self-start lg:sticky lg:top-4">
          {/* <div className="app-shell-banner"> */}
            <p className="gradient-title text-2xl">Well-Being Journal</p>
            {/* <div className="surface-panel mt-6 rounded-3xl"> */}
            <br />
              <p className="theme-text-faint text-xs uppercase tracking-[0.24em] pt-3">Signed in as</p>
              <p className="theme-text mt-2 text-lg font-semibold">{user?.fullName}</p>
              <p className="theme-text-muted text-sm capitalize">{user?.role}</p>
            {/* </div> */}
        {/* </div> */}
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:block">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "nav-pill",
                    isActive ? "nav-pill-active" : "nav-pill-idle"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user?.role === "user" && user?.consentSettings?.allowHelperSharing && (
              <NavLink
                to="/app/feedback"
                className={({ isActive }) =>
                  ["nav-pill", isActive ? "nav-pill-active" : "nav-pill-idle"].join(" ")
                }
              >
                Feedback
              </NavLink>
            )}

            {needsJournal && user?.role === "user" && (
              <div
                className="hidden lg:block mt-2 rounded-2xl px-4 py-3 text-xs"
                style={{
                  background: "oklch(var(--primary-soft))",
                  border: "1px solid oklch(var(--primary) / 0.25)"
                }}
              >
                <p className="theme-text font-semibold mb-1">📓 No entry yet today</p>
                <p className="theme-text-muted leading-5">Take a moment to reflect after your session.</p>
                <Link
                  to="/app/journal/new"
                  className="mt-2 inline-block font-semibold text-xs"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  Write now →
                </Link>
              </div>
            )}
          </nav>

          <div className="mt-6 border-t pt-5" style={{ borderColor: "oklch(var(--line) / 0.65)" }}>
            <button type="button" className="btn-secondary w-full" onClick={logout}>
              Log out
            </button>
          </div>
        </aside>

        <main className="space-y-4">
          <header className="surface-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="theme-text-muted text-sm">Today’s space for reflection</p>
              <h1 className="theme-text mt-1 text-2xl font-semibold">
                {location.pathname.includes("/journal")
                  ? "Journal Editor"
                  : location.pathname.includes("/history")
                    ? "Journal History"
                    : location.pathname.includes("/analytics")
                      ? "Mood Analytics"
                      : location.pathname.includes("/settings")
                        ? "Settings"
                        : location.pathname.includes("/admin")
                          ? "Admin Dashboard"
                          : location.pathname.includes("/breathe")
                            ? "Breathing Exercise"
                            : location.pathname.includes("/helper")
                              ? "Helper Dashboard"
                              : location.pathname.includes("/feedback")
                                ? "Helper Feedback"
                                : "Dashboard"}
              </h1>
            </div>
          </header>
          <NotificationBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
