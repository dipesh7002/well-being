import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ReminderBanner } from "./ReminderBanner";
import { http } from "../../api/http";

vi.mock("../../api/http", () => ({
  http: {
    get: vi.fn()
  }
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      reminderEnabled: true,
      reminderTime: "19:30"
    }
  })
}));

describe("ReminderBanner", () => {
  it("shows a visible reminder when today's final entry is still missing", async () => {
    http.get.mockResolvedValue({
      data: {
        reminder: {
          needsAttention: true,
          reminderTime: "19:30"
        }
      }
    });

    render(
      <MemoryRouter>
        <ReminderBanner />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText("Reminder set for 7:30 PM. Save a final entry today to keep your reflection streak warm.")
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: "Open journal" })).toBeInTheDocument();
  });
});
