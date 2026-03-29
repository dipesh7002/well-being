import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password
      });
      navigate("/app/dashboard");
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="surface-card w-full max-w-lg">
        <p className="gradient-title text-3xl">Create your journal space</p>
        <p className="mt-2 text-sm text-stone-500">
          Build a calm, private routine for reflection, mood tracking, and supportive prompts.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Full name</span>
            <input
              type="text"
              className="input-base"
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              className="input-base"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                className="input-base"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Confirm password</span>
              <input
                type="password"
                className="input-base"
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                required
              />
            </label>
          </div>
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-stone-500">
          Already have an account?{" "}
          <Link className="font-semibold text-orange-600" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

