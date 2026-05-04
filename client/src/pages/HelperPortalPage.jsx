import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function HelperPortalPage() {
  const { login, registerHelper } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function switchTab(next) {
    setTab(next);
    setError("");
    setSuccess("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await login(loginForm);
      if (user.role !== "helper" && user.role !== "admin") {
        setError(
          "This portal is for support helpers only. Please use the main login page."
        );
        return;
      }
      navigate("/app/helper");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await registerHelper({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
      });
      setSuccess(data.message || "Helper account created. Please log in.");
      setSignupForm({ fullName: "", email: "", password: "", confirmPassword: "" });
      setTab("login");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="surface-card w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm theme-text-muted hover:theme-text transition-colors"
        >
          ← Back to home
        </Link>

        <p className="gradient-title text-3xl">Support Helper Portal</p>
        <p className="mt-2 text-sm theme-text-muted">
          A dedicated space for support helpers to access and manage their work.
        </p>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-2xl p-1" style={{ background: "oklch(var(--surface-strong) / 0.6)" }}>
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
              tab === "login" ? "nav-pill-active" : "nav-pill-idle"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
              tab === "signup" ? "nav-pill-active" : "nav-pill-idle"
            }`}
          >
            Create account
          </button>
        </div>

        {success ? (
          <p className="mt-4 text-sm text-emerald-600">{success}</p>
        ) : null}

        {/* Login form */}
        {tab === "login" && (
          <form className="mt-5 space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium theme-text">Email</span>
              <input
                type="email"
                className="input-base"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((c) => ({ ...c, email: e.target.value }))
                }
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium theme-text">Password</span>
              <input
                type="password"
                className="input-base"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((c) => ({ ...c, password: e.target.value }))
                }
                required
              />
            </label>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form className="mt-5 space-y-4" onSubmit={handleSignup}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium theme-text">Full name</span>
              <input
                type="text"
                className="input-base"
                value={signupForm.fullName}
                onChange={(e) =>
                  setSignupForm((c) => ({ ...c, fullName: e.target.value }))
                }
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium theme-text">Email</span>
              <input
                type="email"
                className="input-base"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm((c) => ({ ...c, email: e.target.value }))
                }
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium theme-text">Password</span>
                <input
                  type="password"
                  className="input-base"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm((c) => ({ ...c, password: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium theme-text">Confirm</span>
                <input
                  type="password"
                  className="input-base"
                  value={signupForm.confirmPassword}
                  onChange={(e) =>
                    setSignupForm((c) => ({
                      ...c,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create helper account"}
            </button>
          </form>
        )}

        <p className="mt-5 text-sm theme-text-muted">
          Not a support helper?{" "}
          <Link className="font-semibold text-orange-600" to="/login">
            Regular login
          </Link>
        </p>
      </div>
    </div>
  );
}
