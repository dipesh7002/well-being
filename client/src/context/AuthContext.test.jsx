import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";
import {
  clearStoredAuth,
  getStoredAuth,
  http,
  persistAuth,
  setAuthToken
} from "../api/http";

vi.mock("../api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn()
  },
  setAuthToken: vi.fn(),
  getStoredAuth: vi.fn(),
  persistAuth: vi.fn(),
  clearStoredAuth: vi.fn()
}));

function AuthProbe() {
  const auth = useAuth();

  return (
    <div>
      <p data-testid="loading">{String(auth.loading)}</p>
      <p data-testid="authenticated">{String(auth.isAuthenticated)}</p>
      <p data-testid="name">{auth.user?.fullName || "none"}</p>
      <button type="button" onClick={() => auth.login({ email: "user@example.com", password: "Password123!" })}>
        Log in
      </button>
      <button type="button" onClick={() => auth.logout()}>
        Log out
      </button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  it("bootstraps a stored session and refreshes the user profile", async () => {
    const storedUser = { fullName: "Stored User", themePreference: "sunrise" };
    const refreshedUser = { fullName: "Refreshed User", themePreference: "forest" };

    getStoredAuth.mockReturnValue({ token: "stored-token", user: storedUser });
    http.get.mockResolvedValue({
      data: {
        user: refreshedUser
      }
    });

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));
    expect(screen.getByTestId("name")).toHaveTextContent("Refreshed User");
    expect(setAuthToken).toHaveBeenCalledWith("stored-token");
    expect(persistAuth).toHaveBeenCalledWith({ token: "stored-token", user: refreshedUser });
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("forest"));
  });

  it("clears the stored session if bootstrap fails", async () => {
    getStoredAuth.mockReturnValue({
      token: "expired-token",
      user: { fullName: "Expired User", themePreference: "sunrise" }
    });
    http.get.mockRejectedValue(new Error("Session expired"));

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("false"));
    expect(screen.getByTestId("name")).toHaveTextContent("none");
    expect(clearStoredAuth).toHaveBeenCalled();
    expect(setAuthToken).toHaveBeenCalledWith(null);
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("sunrise"));
  });

  it("supports logging in and logging out", async () => {
    const user = userEvent.setup();
    const loggedInUser = { fullName: "Niyati", themePreference: "dawn" };

    getStoredAuth.mockReturnValue(null);
    http.get.mockResolvedValue({
      data: {
        user: loggedInUser
      }
    });
    http.post.mockImplementation((url) => {
      if (url === "/auth/login") {
        return Promise.resolve({
          data: {
            token: "new-token",
            user: loggedInUser
          }
        });
      }

      if (url === "/auth/logout") {
        return Promise.resolve({
          data: {
            message: "Logged out successfully."
          }
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));
    expect(setAuthToken).toHaveBeenCalledWith("new-token");
    expect(persistAuth).toHaveBeenCalledWith({
      token: "new-token",
      user: loggedInUser
    });

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("false"));
    expect(http.post).toHaveBeenCalledWith("/auth/logout");
    expect(clearStoredAuth).toHaveBeenCalled();
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
  });
});
