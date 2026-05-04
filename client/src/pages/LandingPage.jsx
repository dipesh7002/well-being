import { Link } from "react-router-dom";

const features = [
  {
    title: "Private journaling",
    desc: "Write freely. Your entries are secured and visible only to you.",
  },
  {
    title: "Mood tracking",
    desc: "Spot emotional patterns across days and weeks without guessing.",
  },
  {
    title: "Streaks & prompts",
    desc: "Gentle reminders and badges that encourage, never demand.",
  },
  {
    title: "AI-assisted insights",
    desc: "Optional mood detection — you always make the final call.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="gradient-title text-xl font-semibold">Well-Being</span>
        <div className="flex items-center gap-2">
          <Link
            to="/helper-portal"
            className="hidden items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:inline-flex"
            style={{ borderColor: "oklch(var(--line))", color: "oklch(var(--muted))" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Helper portal
          </Link>
          <div className="mx-1 hidden h-4 w-px sm:block" style={{ background: "oklch(var(--line))" }} />
          <Link to="/login" className="btn-secondary">Log in</Link>
          <Link to="/signup" className="btn-primary">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-20 text-center">
        <h1 className="text-6xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
          A calmer way to
          <br />
          <span className="gradient-title">know yourself.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg theme-text-muted">
          Write privately, track your mood, and build gentle reflection habits.
        </p>
        <Link to="/signup" className="btn-primary mt-10 px-9 py-3.5 text-base">
          Start for free
        </Link>
        <p className="mt-4 text-xs theme-text-faint">
          Not therapy or diagnosis — a supportive tool for reflection.
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="surface-card">
              <p className="font-semibold theme-text">{f.title}</p>
              <p className="mt-2 text-sm leading-6 theme-text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
