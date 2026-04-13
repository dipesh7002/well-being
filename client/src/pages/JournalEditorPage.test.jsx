import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { JournalEditorPage } from "./JournalEditorPage";
import { http } from "../api/http";

vi.mock("../api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

function renderJournalEditor(initialEntry) {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/app/journal/new" element={<JournalEditorPage />} />
        <Route path="/app/journal/:id/edit" element={<JournalEditorPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("JournalEditorPage", () => {
  it("loads the guided prompt for a new entry and submits a final journal", async () => {
    const user = userEvent.setup();
    const createdEntry = {
      _id: "entry-1",
      status: "final",
      finalMood: "happy",
      detectedMood: "calm",
      analysisSource: "python",
      sentimentScore: 0.68,
      wordCount: 8,
      emotionSignals: {
        anxious: 0,
        stressed: 0,
        sad: 0,
        calm: 2,
        happy: 1
      }
    };

    http.get.mockImplementation((url) => {
      if (url === "/dashboard/summary") {
        return Promise.resolve({
          data: {
            guidedPrompt: {
              text: "What felt grounding today?"
            }
          }
        });
      }

      if (url === "/journals/entry-1") {
        return Promise.resolve({
          data: {
            entry: {
              ...createdEntry,
              entryDate: "2024-09-02T12:00:00.000Z",
              manualMood: "happy",
              text: "I felt proud of a calm, productive afternoon.",
              promptUsed: "What felt grounding today?"
            }
          }
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    http.post.mockResolvedValue({
      data: {
        entry: createdEntry,
        suggestion: {
          title: "Protect the good moment",
          description: "Name one thing that helped today go well.",
          reason: "Based on your recent mood pattern and latest entry."
        },
        distressSupport: null
      }
    });

    renderJournalEditor("/app/journal/new");

    expect(await screen.findByDisplayValue("What felt grounding today?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Happy/ }));
    await user.type(
      screen.getByRole("textbox", { name: /Journal text/i }),
      "I felt proud of a calm, productive afternoon."
    );
    await user.click(screen.getByRole("button", { name: "Save final entry" }));

    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith(
        "/journals",
        expect.objectContaining({
          text: "I felt proud of a calm, productive afternoon.",
          manualMood: "happy",
          finalMood: "happy",
          status: "final",
          promptUsed: "What felt grounding today?"
        })
      )
    );

    expect(await screen.findByText("Entry saved")).toBeInTheDocument();
    expect(screen.getByText("Saved as final")).toBeInTheDocument();
    expect(screen.getByText("Protect the good moment")).toBeInTheDocument();
    expect(screen.getByText("AI emotion analysis")).toBeInTheDocument();
    expect(screen.getByText("Pretrained VADER analysis")).toBeInTheDocument();
    expect(screen.getAllByText("8 words").length).toBeGreaterThan(0);
  });

  it("loads an existing entry and updates it as a draft", async () => {
    const user = userEvent.setup();

    http.get.mockImplementation((url) => {
      if (url === "/dashboard/summary") {
        return Promise.resolve({
          data: {
            guidedPrompt: {
              text: "What helped you feel steadier today?"
            }
          }
        });
      }

      if (url === "/journals/entry-42") {
        return Promise.resolve({
          data: {
            entry: {
              _id: "entry-42",
              entryDate: "2024-09-03T12:00:00.000Z",
              text: "I felt overloaded in the morning.",
              manualMood: "stressed",
              finalMood: "stressed",
              promptUsed: "What helped you feel steadier today?",
              status: "draft"
            }
          }
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    http.put.mockResolvedValue({
      data: {
        entry: {
          _id: "entry-42",
          status: "draft",
          finalMood: "stressed",
          detectedMood: "stressed",
          analysisSource: "internal",
          sentimentScore: -0.44,
          wordCount: 10,
          emotionSignals: {
            anxious: 0,
            stressed: 2,
            sad: 1,
            calm: 0,
            happy: 0
          }
        },
        suggestion: {
          title: "Take a short reset break",
          description: "Step away and loosen your shoulders for one minute.",
          reason: "Based on repeated stress showing up across your recent entries."
        },
        distressSupport: {
          title: "Extra support may help right now",
          message: "Pause and reach out if you need support.",
          resourceLink: "https://example.com/support"
        }
      }
    });

    renderJournalEditor("/app/journal/entry-42/edit");

    expect(await screen.findByDisplayValue("I felt overloaded in the morning.")).toBeInTheDocument();

    const textarea = screen.getByRole("textbox", { name: /Journal text/i });
    await user.clear(textarea);
    await user.type(textarea, "I felt hopeless earlier, but I am slowing things down.");
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() =>
      expect(http.put).toHaveBeenCalledWith(
        "/journals/entry-42",
        expect.objectContaining({
          text: "I felt hopeless earlier, but I am slowing things down.",
          status: "draft",
          manualMood: "stressed",
          finalMood: "stressed"
        })
      )
    );

    expect(await screen.findByText("Entry saved")).toBeInTheDocument();
    expect(screen.getByText("Saved as draft")).toBeInTheDocument();
    expect(screen.getByText("Rule-based fallback analysis")).toBeInTheDocument();
    expect(screen.getByText("Why this suggestion: Based on repeated stress showing up across your recent entries.")).toBeInTheDocument();
    expect(screen.getByText("Extra support may help right now")).toBeInTheDocument();
  });
});
