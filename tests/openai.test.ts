import { describe, expect, it, vi } from "vitest";

import type { ChatMessage } from "@/lib/chat-parser";
import type { LoreResult } from "@/lib/lore-schema";
import {
  generateLore,
  InvalidLoreOutputError,
  LoreRefusalError,
  type ResponsesClient,
} from "@/lib/openai";

const messages: ChatMessage[] = [
  { speaker: "Maya", text: "one more song" },
  { speaker: "Kevin", text: "wait where are you guys" },
  { speaker: "Maya", text: "parking lot, now" },
  { speaker: "Kevin", text: "I found a fountain" },
  { speaker: "Maya", text: "This is the wrong fountain" },
  { speaker: "Kevin", text: "On my way probably" },
];

const validResult: LoreResult = {
  season_title: "The Fountain Detour",
  episode_title: "One More Song",
  chat_recap:
    "A meetup becomes a navigation epic. Maya directs traffic while Kevin finds the wrong landmark.",
  cast: [
    {
      name: "Maya",
      role: "The Dispatcher",
      special_trait: "Issues perfect three-word plans",
      quote: "parking lot, now",
    },
    {
      name: "Kevin",
      role: "The Explorer",
      special_trait: "Finds fountains under pressure",
      quote: "I found a fountain",
    },
  ],
  lore_stats: Array.from({ length: 6 }, (_, index) => ({
    label: `Stat ${index + 1}`,
    value: `${index + 1}x`,
    evidence: "Kevin reports a fountain after asking for the group's location.",
  })),
  running_jokes: ["Kevin is still en route.", "Maya has become dispatch."],
  iconic_quote: { speaker: "Kevin", quote: "I found a fountain" },
  iconic_moment: "Kevin proudly locates the wrong fountain.",
  next_episode_teaser: "A map pin enters the chat, but certainty does not.",
};

function clientReturning(...responses: unknown[]) {
  const create = vi.fn();
  responses.forEach((response) => create.mockResolvedValueOnce(response));
  return { client: { responses: { create } } as ResponsesClient, create };
}

describe("generateLore", () => {
  it("requests strict structured output and isolates the transcript as user data", async () => {
    const { client, create } = clientReturning({
      output_text: JSON.stringify(validResult),
      output: [],
    });

    await generateLore(messages, { client, model: "test-model" });

    const request = create.mock.calls[0][0];
    expect(request.model).toBe("test-model");
    expect(request.text.format).toMatchObject({
      type: "json_schema",
      name: "lore_result",
      strict: true,
    });
    expect(request.instructions).not.toContain("I found a fountain");
    expect(JSON.stringify(request.input)).toContain("I found a fountain");
  });

  it("retries once when the first response is invalid", async () => {
    const { client, create } = clientReturning(
      { output_text: "not json", output: [] },
      { output_text: JSON.stringify(validResult), output: [] },
    );

    await expect(
      generateLore(messages, { client, model: "test-model" }),
    ).resolves.toEqual(validResult);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("fails after two invalid responses", async () => {
    const { client, create } = clientReturning(
      { output_text: "not json", output: [] },
      { output_text: "still not json", output: [] },
    );

    await expect(
      generateLore(messages, { client, model: "test-model" }),
    ).rejects.toBeInstanceOf(InvalidLoreOutputError);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("maps a model refusal without retrying", async () => {
    const { client, create } = clientReturning({
      output_text: "",
      output: [
        {
          type: "message",
          content: [{ type: "refusal", refusal: "Cannot comply" }],
        },
      ],
    });

    await expect(
      generateLore(messages, { client, model: "test-model" }),
    ).rejects.toBeInstanceOf(LoreRefusalError);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
