import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoleRoute } from "./RoleRoute";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn()
}));

function renderRoleRoute() {
  return render(
    <MemoryRouter
      initialEntries={["/app/admin"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/app/dashboard" element={<div>Dashboard</div>} />
        <Route
          path="/app/admin"
          element={
            <RoleRoute roles={["admin"]}>
              <div>Admin panel</div>
            </RoleRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("RoleRoute", () => {
  it("redirects users without the required role", () => {
    useAuth.mockReturnValue({
      user: { role: "user" }
    });

    renderRoleRoute();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the page when the role matches", () => {
    useAuth.mockReturnValue({
      user: { role: "admin" }
    });

    renderRoleRoute();

    expect(screen.getByText("Admin panel")).toBeInTheDocument();
  });
});
