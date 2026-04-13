import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { Badge } from "../src/models/Badge.js";
import { SharedAccess } from "../src/models/SharedAccess.js";
import { Suggestion } from "../src/models/Suggestion.js";
import { env } from "../src/config/env.js";
import { authHeaders, createJournalEntry, createUser } from "./helpers/factories.js";

describe("journal routes", () => {
  it("creates a journal entry, applies fallback suggestion logic, and returns distress support", async () => {
    env.aiMode = "internal";

    const user = await createUser();

    await Badge.create({
      name: "7-Day Reflection",
      slug: "7-day-streak",
      description: "Completed a 7-day journaling streak.",
      thresholdDays: 7,
      icon: "spark"
    });
    await Suggestion.create({
      mood: "happy",
      title: "Celebrate and reinforce the moment",
      description: "Capture what contributed to this feeling today.",
      resourceLink: ""
    });

    const response = await request(app)
      .post("/api/journals")
      .set(authHeaders(user))
      .send({
        entryDate: "2024-09-02",
        text: "I feel hopeless at times, but I also feel grateful, peaceful, and steady today.",
        manualMood: "happy",
        status: "final"
      });

    expect(response.status).toBe(201);
    expect(response.body.entry).toMatchObject({
      manualMood: "happy",
      finalMood: "happy",
      status: "final",
      analysisSource: "internal"
    });
    expect(response.body.suggestion.title).toBe("Celebrate and reinforce the moment");
    expect(response.body.suggestion.reason).toBe("Based on your recent mood pattern and latest entry.");
    expect(response.body.distressSupport).toMatchObject({
      title: "Extra support may help right now",
      resourceLink: env.resourceUrl
    });
    expect(response.body.entry.detectedMood).toBe("sad");
    expect(response.body.entry.wordCount).toBeGreaterThan(0);
    expect(response.body.entry.emotionSignals.sad).toBeGreaterThan(0);
  });

  it("updates and lists a user's entries", async () => {
    env.aiMode = "off";
    const user = await createUser();
    const entry = await createJournalEntry({
      user,
      entryDate: new Date("2024-09-03T12:00:00.000Z"),
      text: "Existing text",
      manualMood: "neutral",
      finalMood: "neutral"
    });

    const updateResponse = await request(app)
      .put(`/api/journals/${entry._id}`)
      .set(authHeaders(user))
      .send({
        entryDate: "2024-09-03",
        text: "Updated text",
        manualMood: "calm",
        status: "draft"
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.entry).toMatchObject({
      text: "Updated text",
      manualMood: "calm",
      finalMood: "calm",
      status: "draft",
      analysisSource: "off",
      wordCount: 2
    });
    expect(updateResponse.body.suggestion.reason).toBe("Based on your recent mood pattern and latest entry.");

    const listResponse = await request(app).get("/api/journals?mood=calm").set(authHeaders(user));

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.pagination.total).toBe(1);
    expect(listResponse.body.entries[0]).toMatchObject({
      _id: entry._id.toString(),
      manualMood: "calm",
      wordCount: 2
    });
  });

  it("shares an entry with an active helper when consent is enabled", async () => {
    env.aiMode = "off";
    const user = await createUser({
      fullName: "Sharer",
      consentSettings: {
        allowHelperSharing: true,
        shareMoodSummaries: false
      }
    });
    const helper = await createUser({
      fullName: "Helper Person",
      role: "helper"
    });
    const entry = await createJournalEntry({
      user,
      text: "Please share this with my helper."
    });

    const response = await request(app)
      .post(`/api/journals/${entry._id}/share`)
      .set(authHeaders(user))
      .send({
        helperId: helper._id.toString()
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Entry shared with Helper Person.");

    const access = await SharedAccess.findOne({
      userId: user._id,
      helperId: helper._id
    }).lean();

    expect(access.sharedEntryIds.map((value) => value.toString())).toContain(entry._id.toString());
    expect(access.revokedAt).toBeNull();
  });
});
