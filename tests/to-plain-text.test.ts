import { describe, expect, it } from "vitest";

import type { LoreResult } from "@/lib/lore-schema";
import { toPlainText } from "@/lib/to-plain-text";

const result: LoreResult = {
  season_title: "The Fountain Detour",
  episode_title: "One More Song",
  chat_recap: "A meetup becomes a navigation epic.",
  cast: [
    {
      name: "Maya",
      role: "The Dispatcher",
      special_trait: "Perfect three-word plans",
      quote: "parking lot, now",
    },
    {
      name: "Kevin",
      role: "The Explorer",
      special_trait: "Finds the wrong landmark",
      quote: "I found a fountain",
    },
  ],
  lore_stats: Array.from({ length: 6 }, (_, index) => ({
    label: `Stat ${index + 1}`,
    value: `${index + 1}x`,
    evidence: `Evidence ${index + 1}`,
  })),
  running_jokes: ["Kevin is still en route.", "Maya has become dispatch."],
  iconic_quote: { speaker: "Kevin", quote: "I found a fountain" },
  iconic_moment: "The fountain reveal changes everything.",
  next_episode_teaser: "Someone finally sends a map pin.",
};

describe("toPlainText", () => {
  it("formats all nine recap sections as readable plain text", () => {
    const text = toPlainText(result);

    expect(text).toContain("SEASON TITLE\nThe Fountain Detour");
    expect(text).toContain("EPISODE TITLE\nOne More Song");
    expect(text).toContain("CHAT RECAP\nA meetup becomes a navigation epic.");
    expect(text).toContain("CAST\nMaya - The Dispatcher");
    expect(text).toContain('Quote: "parking lot, now"');
    expect(text).toContain("LORE STATS\n1. Stat 1: 1x");
    expect(text).toContain("Evidence: Evidence 1");
    expect(text).toContain("RUNNING JOKES\n- Kevin is still en route.");
    expect(text).toContain('ICONIC QUOTE\nKevin: "I found a fountain"');
    expect(text).toContain(
      "ICONIC MOMENT\nThe fountain reveal changes everything.",
    );
    expect(text).toContain(
      "NEXT EPISODE TEASER\nSomeone finally sends a map pin.",
    );
    expect(text).not.toContain("[object Object]");
  });
});
