import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-lg text-center">
        <p className="gradient-title text-4xl">Page not found</p>
        <p className="mt-4 text-sm text-stone-500">
          The space you were looking for is not here. You can head back to the landing page or continue to your dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-secondary">
            Landing page
          </Link>
          <Link to="/app/dashboard" className="btn-primary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
