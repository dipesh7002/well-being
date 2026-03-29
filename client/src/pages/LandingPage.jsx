import { Link } from "react-router-dom";

const features = [
  "Private journaling with secure accounts and role-based access",
  "Mood tracking, trend charts, streaks, badges, and supportive prompts",
  "Optional AI-assisted mood detection with user-controlled final mood choices",
  "Gentle self-care suggestions and calm safety resource messaging"
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="surface-card relative overflow-hidden bg-hero-glow">
          <div className="absolute -left-12 top-0 h-56 w-56 rounded-full bg-orange-300/25 blur-3xl" />
          <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="relative grid gap-10 px-2 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-6">
            <div className="space-y-6">
              <div className="badge-pill">Supportive journaling for students and working adults</div>
              <div>
                <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-stone-900 md:text-6xl">
                  A warm digital home for reflection, mood awareness, and steady habits.
                </h1>
                <p className="mt-5 max-w-2xl text-lg text-stone-600">
                  Well-Being Journal helps people write privately, notice emotional patterns, and build
                  a gentler rhythm of care through prompts, streaks, insights, and mood-aware support.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="btn-primary">
                  Create account
                </Link>
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
              </div>
              <p className="text-sm text-stone-500">
                This app is a supportive well-being tool only. It is not therapy, diagnosis, or emergency intervention.
              </p>
            </div>

            <div className="surface-card-muted border-none bg-white/75 p-6">
              <p className="gradient-title text-3xl">Today’s reflection could begin with:</p>
              <div className="mt-6 rounded-[28px] bg-white p-5 shadow-soft">
                <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Guided prompt</p>
                <p className="mt-3 text-lg font-medium text-stone-800">
                  What helped you feel even a little more grounded today?
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[28px] bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-stone-700">Mood trends</p>
                  <p className="mt-2 text-sm text-stone-500">Spot patterns across days and weeks instead of guessing.</p>
                </div>
                <div className="rounded-[28px] bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-stone-700">Streak rewards</p>
                  <p className="mt-2 text-sm text-stone-500">Celebrate consistency with badges that feel encouraging, not demanding.</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature} className="surface-card">
              <p className="text-sm leading-6 text-stone-600">{feature}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card">
            <h2 className="text-2xl font-semibold text-stone-900">Why this app exists</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Paper journaling can be powerful, but it usually does not surface mood patterns, provide guided prompts,
              or make it easy to maintain a reflection habit. This app combines private writing, emotional awareness,
              and supportive routines in one calm experience.
            </p>
          </div>
          <div className="surface-card bg-gradient-to-br from-orange-50 via-white to-rose-50">
            <h2 className="text-2xl font-semibold text-stone-900">What makes it different</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-semibold text-stone-700">Free reflection depth</p>
                <p className="mt-2 text-sm text-stone-500">Combines mood logs and real writing, not just quick taps.</p>
              </div>
              <div>
                <p className="font-semibold text-stone-700">Supportive insights</p>
                <p className="mt-2 text-sm text-stone-500">Encouragement, prompts, streaks, and gentle suggestions work together.</p>
              </div>
              <div>
                <p className="font-semibold text-stone-700">Privacy by default</p>
                <p className="mt-2 text-sm text-stone-500">Admins see aggregates, and helpers only see entries shared with consent.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

