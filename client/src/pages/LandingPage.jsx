import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    label: "Private journaling",
    desc: "Your entries are encrypted and visible only to you — always.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    label: "Mood tracking",
    desc: "Spot emotional patterns across days and weeks without guessing.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    ),
    label: "Streaks & prompts",
    desc: "Gentle reminders that encourage consistency, never demand it.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2l4 4-4 4"/><path d="M22 6h-6"/>
      </svg>
    ),
    label: "AI-assisted insights",
    desc: "Optional mood detection powered by AI — you stay in control.",
  },
];


export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-50" style={{ background: "oklch(var(--bg))", borderBottom: "1px solid oklch(var(--line) / 0.35)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-5">
          {/* Wordmark */}
          <span className="gradient-title text-[1.1rem] font-semibold tracking-[-0.01em]">Well-Being</span>

          {/* Nav links + CTA */}
          <div className="flex items-center gap-7">
            <Link to="/helper-portal" className="btn-secondary hidden sm:inline-flex items-center gap-2 text-sm px-5 py-2.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Helpers
            </Link>

            <Link to="/login" className="btn-secondary text-sm px-5 py-2.5">
              Log in
            </Link>

            <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-28 pb-24 text-center overflow-hidden">
        {/* Subtle glow blob */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, oklch(var(--primary-soft) / 0.55), transparent)",
          }}
        />


        <h1
          className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl lg:text-[4.5rem]"
          style={{ color: "oklch(var(--text))" }}
        >
          A calmer way to
          <br />
          <span className="gradient-title">know yourself.</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-lg text-lg leading-relaxed"
          style={{ color: "oklch(var(--muted))" }}
        >
          Write privately, track your mood, and build gentle reflection habits — all in one quiet space.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/signup" className="btn-primary px-8 py-3.5 text-base">
            Start for free
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
            Sign in
          </Link>
        </div>

        <p className="mt-5 text-xs" style={{ color: "oklch(var(--muted) / 0.6)" }}>
          Not therapy or diagnosis — a supportive tool for reflection.
        </p>
      </section>


{/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "oklch(var(--text))" }}
          >
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-base theme-text-muted">
            Thoughtfully designed to be simple, private, and genuinely helpful.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="group relative flex flex-col gap-5 rounded-3xl border p-6 transition-shadow duration-200"
              style={{
                background: "oklch(var(--surface) / 0.85)",
                borderColor: "oklch(var(--line) / 0.7)",
                boxShadow: "0 2px 16px oklch(var(--text) / 0.04)",
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: "oklch(var(--primary-soft))",
                  color: "oklch(var(--primary))",
                }}
              >
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold theme-text">{f.label}</p>
                <p className="mt-1.5 text-sm leading-6 theme-text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="mt-auto border-t"
        style={{ borderColor: "oklch(var(--line) / 0.45)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
          <span className="gradient-title text-sm font-semibold">Well-Being</span>
          <div className="flex items-center gap-6">
            <Link to="/helper-portal" className="text-xs theme-text-faint transition-colors hover:theme-text-muted">
              Helper portal
            </Link>
            <Link to="/login" className="text-xs theme-text-faint transition-colors hover:theme-text-muted">
              Log in
            </Link>
            <Link to="/signup" className="text-xs theme-text-faint transition-colors hover:theme-text-muted">
              Sign up
            </Link>
          </div>
          <p className="text-xs theme-text-faint hidden sm:block">© 2025 Well-Being</p>
        </div>
      </footer>
    </div>
  );
}
