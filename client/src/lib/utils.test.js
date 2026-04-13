import { describe, expect, it } from "vitest";
import { cn, countWords, formatDateInput, formatFriendlyDate, getMoodMeta, toTitleCase } from "./utils";

describe("client utils", () => {
  it("joins only truthy class names", () => {
    expect(cn("surface-card", false, null, "rounded", undefined, "shadow")).toBe("surface-card rounded shadow");
  });

  it("formats friendly and input dates consistently", () => {
    const value = "2024-09-02T12:00:00.000Z";

    expect(formatFriendlyDate(value)).toBe("Sep 2, 2024");
    expect(formatDateInput(value)).toBe("2024-09-02");
  });

  it("falls back to the neutral mood metadata", () => {
    expect(getMoodMeta("unknown")).toMatchObject({
      label: "Neutral",
      emoji: "🙂"
    });
  });

  it("converts strings to title case", () => {
    expect(toTitleCase("well being journal")).toBe("Well Being Journal");
  });

  it("counts words using whitespace-separated text", () => {
    expect(countWords("  A short reflective entry  ")).toBe(4);
  });
});
