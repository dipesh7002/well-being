export function LoadingScreen({ label = "Loading your journal space..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface-card max-w-md text-center">
        <p className="gradient-title text-2xl">Well-Being Journal</p>
        <p className="mt-4 text-sm text-stone-500">{label}</p>
      </div>
    </div>
  );
}

