import { describe, expect, it } from "vitest";

import {
  ChatValidationError,
  getChatCounts,
  parseChat,
} from "@/lib/chat-parser";

function expectValidationError(chatText: string, message: string) {
  expect(() => parseChat(chatText)).toThrowError(
    new ChatValidationError(message),
  );
}

describe("parseChat", () => {
  it("parses valid messages and trims surrounding whitespace", () => {
    const parsed = parseChat(`
      Maya: one more song
      Kevin: wait where are you guys
      Alex: I'm emotionally ready for Queen
      Maya: parking lot, now
      Kevin: I found a fountain
      Alex: That is not the venue
    `);

    expect(parsed.messages).toEqual([
      { speaker: "Maya", text: "one more song" },
      { speaker: "Kevin", text: "wait where are you guys" },
      { speaker: "Alex", text: "I'm emotionally ready for Queen" },
      { speaker: "Maya", text: "parking lot, now" },
      { speaker: "Kevin", text: "I found a fountain" },
      { speaker: "Alex", text: "That is not the venue" },
    ]);
    expect(parsed.speakers).toEqual(["Maya", "Kevin", "Alex"]);
  });

  it("tolerates timestamps before the speaker", () => {
    const parsed = parseChat([
      "[10:42 PM] Maya: one more song",
      "[10:43 PM] Kevin: wait where are you guys",
      "[10:44 PM] Maya: parking lot, now",
      "[10:45 PM] Kevin: I found a fountain",
      "[10:46 PM] Maya: This is the wrong fountain",
      "[10:47 PM] Kevin: On my way probably",
    ].join("\n"));

    expect(parsed.messages[0]).toEqual({
      speaker: "Maya",
      text: "one more song",
    });
  });

  it("rejects empty input with the exact PRD message", () => {
    expectValidationError(" \n ", "Paste a group chat first.");
  });

  it("rejects excerpts longer than 12,000 characters", () => {
    expectValidationError(
      `Maya: ${"x".repeat(12_001)}`,
      "Keep the excerpt under 12,000 characters for this demo.",
    );
  });

  it("rejects fewer than six parsed messages", () => {
    expectValidationError(
      [
        "Maya: one",
        "Kevin: two",
        "Maya: three",
        "Kevin: four",
        "Maya: five",
      ].join("\n"),
      "Add at least 6 messages so there is enough lore to work with.",
    );
  });

  it("rejects chats with only one speaker", () => {
    expectValidationError(
      Array.from({ length: 6 }, (_, index) => `Maya: message ${index}`).join(
        "\n",
      ),
      "This needs at least 2 speakers to feel like a group chat.",
    );
  });

  it("rejects input when fewer than 60 percent of non-empty lines match", () => {
    expectValidationError(
      [
        "Maya: one",
        "Kevin: two",
        "Maya: three",
        "Kevin: four",
        "Maya: five",
        "Kevin: six",
        "not a message",
        "still malformed",
        "also malformed",
        "wrong again",
        "fifth bad line",
      ].join("\n"),
      "Use one message per line in the format Name: message.",
    );
  });

  it("accepts exactly 60 percent matching lines", () => {
    const parsed = parseChat(
      [
        "Maya: one",
        "Kevin: two",
        "Maya: three",
        "Kevin: four",
        "Maya: five",
        "Kevin: six",
        "bad line",
        "another bad line",
        "bad again",
        "last bad line",
      ].join("\n"),
    );

    expect(parsed.messages).toHaveLength(6);
  });

  it("counts matching messages and distinct speakers without requiring validity", () => {
    expect(getChatCounts("Maya: hi\nKevin: hello\nno separator\nMaya: bye")).toEqual({
      messages: 3,
      speakers: 2,
    });
  });
});
