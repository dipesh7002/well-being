import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { NotificationBar } from "../common/NotificationBar";
import { ReminderBanner } from "../common/ReminderBanner";

const navigationByRole = {
  user: [
    { label: "Dashboard", to: "/app/dashboard" },
    { label: "New Entry", to: "/app/journal/new" },
    { label: "History", to: "/app/history" },
    { label: "Analytics", to: "/app/analytics" },
    { label: "Settings", to: "/app/settings" }
  ],
  admin: [
    { label: "Dashboard", to: "/app/dashboard" },
    { label: "New Entry", to: "/app/journal/new" },
    { label: "History", to: "/app/history" },
    { label: "Analytics", to: "/app/analytics" },
    { label: "Settings", to: "/app/settings" },
    { label: "Admin", to: "/app/admin" }
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

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="surface-card overflow-hidden bg-hero-glow">
          <div className="rounded-4xl bg-gradient-to-br from-orange-100/70 via-white/70 to-rose-100/70 p-6">
            <p className="gradient-title text-3xl">Well-Being Journal</p>
            <p className="mt-3 text-sm text-stone-600">
              Private reflection, mood awareness, and supportive care in one calm space.
            </p>
            <div className="mt-6 rounded-3xl bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Signed in as</p>
              <p className="mt-2 text-lg font-semibold text-stone-800">{user?.fullName}</p>
              <p className="text-sm capitalize text-stone-500">{user?.role}</p>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:block">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "mb-2 inline-flex min-w-max rounded-full px-4 py-2 text-sm font-medium transition-colors lg:flex",
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-white/70 text-stone-600 hover:bg-orange-50"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-orange-100 pt-5">
            <button type="button" className="btn-secondary w-full" onClick={logout}>
              Log out
            </button>
          </div>
        </aside>

        <main className="space-y-4">
          <header className="surface-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-stone-500">Today’s space for reflection</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-800">
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
                          : location.pathname.includes("/helper")
                            ? "Helper Dashboard"
                            : "Dashboard"}
              </h1>
            </div>
            <div className="badge-pill">
              <span>Supportive tool only</span>
            </div>
          </header>
          <NotificationBar />
          <ReminderBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
