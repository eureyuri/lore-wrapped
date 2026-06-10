import { describe, expect, it } from "vitest";

import {
  LoreResultSchema,
  validateLoreResultForMessages,
  type LoreResult,
} from "@/lib/lore-schema";

const messages = [
  { speaker: "Maya", text: "one more song" },
  { speaker: "Kevin", text: "wait where are you guys" },
  { speaker: "Maya", text: "parking lot, now" },
  { speaker: "Kevin", text: "I found a fountain" },
  { speaker: "Maya", text: "This is the wrong fountain" },
  { speaker: "Kevin", text: "On my way probably" },
];

const validResult: LoreResult = {
  season_title: "The Fountain Detour",
  episode_title: "One More Song, Three More Locations",
  chat_recap:
    "A simple meetup becomes a navigation epic. Maya directs traffic while Kevin discovers every landmark except the venue.",
  cast: [
    {
      name: "Maya",
      role: "The Dispatcher",
      special_trait: "Can turn three words into a complete itinerary",
      quote: "parking lot, now",
    },
    {
      name: "Kevin",
      role: "The Accidental Explorer",
      special_trait: "Finds fountains under pressure",
      quote: "I found a fountain",
    },
  ],
  lore_stats: Array.from({ length: 6 }, (_, index) => ({
    label: `Chaos metric ${index + 1}`,
    value: `${index + 1}x`,
    evidence: "Kevin asks where everyone is and then reports a fountain.",
  })),
  running_jokes: ["Kevin remains geographically theoretical.", "Maya speaks in commands."],
  iconic_quote: { speaker: "Kevin", quote: "I found a fountain" },
  iconic_moment: "Kevin proudly locates the wrong landmark.",
  next_episode_teaser:
    "Next time, the group shares a pin. Kevin still finds a fountain.",
};

describe("LoreResultSchema", () => {
  it("accepts exactly the nine required top-level fields", () => {
    expect(LoreResultSchema.parse(validResult)).toEqual(validResult);
  });

  it("rejects missing and extra top-level fields", () => {
    const { episode_title: _episodeTitle, ...missingField } = validResult;

    expect(LoreResultSchema.safeParse(missingField).success).toBe(false);
    expect(
      LoreResultSchema.safeParse({ ...validResult, bonus: "nope" }).success,
    ).toBe(false);
  });

  it("enforces cast, stat, and running-joke item bounds", () => {
    expect(
      LoreResultSchema.safeParse({ ...validResult, cast: validResult.cast.slice(0, 1) })
        .success,
    ).toBe(false);
    expect(
      LoreResultSchema.safeParse({ ...validResult, lore_stats: validResult.lore_stats.slice(0, 5) })
        .success,
    ).toBe(false);
    expect(
      LoreResultSchema.safeParse({ ...validResult, running_jokes: ["only one"] })
        .success,
    ).toBe(false);
    expect(
      LoreResultSchema.safeParse({
        ...validResult,
        running_jokes: ["one", "two", "three", "four", "five"],
      }).success,
    ).toBe(false);
  });
});

describe("validateLoreResultForMessages", () => {
  it("accepts iconic and cast quotes spoken verbatim by their named speakers", () => {
    expect(validateLoreResultForMessages(validResult, messages)).toEqual(validResult);
  });

  it("rejects an iconic quote absent from the source messages", () => {
    expect(() =>
      validateLoreResultForMessages(
        {
          ...validResult,
          iconic_quote: { speaker: "Kevin", quote: "I found two fountains" },
        },
        messages,
      ),
    ).toThrow("Iconic quote must match a source message verbatim.");
  });

  it("rejects a quote attributed to the wrong speaker", () => {
    expect(() =>
      validateLoreResultForMessages(
        {
          ...validResult,
          iconic_quote: { speaker: "Maya", quote: "I found a fountain" },
        },
        messages,
      ),
    ).toThrow("Iconic quote must match a source message verbatim.");
  });

  it("rejects cast quotes that are not source-grounded", () => {
    expect(() =>
      validateLoreResultForMessages(
        {
          ...validResult,
          cast: [
            { ...validResult.cast[0], quote: "I never said this" },
            validResult.cast[1],
          ],
        },
        messages,
      ),
    ).toThrow("Cast quotes must match source messages verbatim.");
  });
});
