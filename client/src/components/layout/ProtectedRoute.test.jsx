import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn()
}));

function renderProtectedRoute() {
  return render(
    <MemoryRouter
      initialEntries={["/app/dashboard"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/login" element={<div>Login screen</div>} />
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <div>Private content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProtectedRoute", () => {
  it("shows the loading screen while auth is bootstrapping", () => {
    useAuth.mockReturnValue({
      loading: true,
      isAuthenticated: false
    });

    renderProtectedRoute();

    expect(screen.getByText("Well-Being Journal")).toBeInTheDocument();
    expect(screen.getByText("Loading your journal space...")).toBeInTheDocument();
  });

  it("redirects guests to the login page", () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: false
    });

    renderProtectedRoute();

    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("renders the protected content for authenticated users", () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true
    });

    renderProtectedRoute();

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});
