import { z } from "zod";

import type { ChatMessage } from "@/lib/chat-parser";

const requiredText = z.string().trim().min(1);

export const CastMemberSchema = z
  .object({
    name: requiredText,
    role: requiredText,
    special_trait: requiredText,
    quote: requiredText,
  })
  .strict();

export const LoreStatSchema = z
  .object({
    label: requiredText,
    value: requiredText,
    evidence: requiredText,
  })
  .strict();

export const LoreResultSchema = z
  .object({
    season_title: requiredText,
    episode_title: requiredText,
    chat_recap: requiredText,
    cast: z.array(CastMemberSchema).min(2).max(6),
    lore_stats: z.array(LoreStatSchema).length(6),
    running_jokes: z.array(requiredText).min(2).max(4),
    iconic_quote: z
      .object({
        speaker: requiredText,
        quote: requiredText,
      })
      .strict(),
    iconic_moment: requiredText,
    next_episode_teaser: requiredText,
  })
  .strict();

export type CastMember = z.infer<typeof CastMemberSchema>;
export type LoreStat = z.infer<typeof LoreStatSchema>;
export type LoreResult = z.infer<typeof LoreResultSchema>;

export const LoreResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "season_title",
    "episode_title",
    "chat_recap",
    "cast",
    "lore_stats",
    "running_jokes",
    "iconic_quote",
    "iconic_moment",
    "next_episode_teaser",
  ],
  properties: {
    season_title: { type: "string", minLength: 1 },
    episode_title: { type: "string", minLength: 1 },
    chat_recap: { type: "string", minLength: 1 },
    cast: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "role", "special_trait", "quote"],
        properties: {
          name: { type: "string", minLength: 1 },
          role: { type: "string", minLength: 1 },
          special_trait: { type: "string", minLength: 1 },
          quote: { type: "string", minLength: 1 },
        },
      },
    },
    lore_stats: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value", "evidence"],
        properties: {
          label: { type: "string", minLength: 1 },
          value: { type: "string", minLength: 1 },
          evidence: { type: "string", minLength: 1 },
        },
      },
    },
    running_jokes: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string", minLength: 1 },
    },
    iconic_quote: {
      type: "object",
      additionalProperties: false,
      required: ["speaker", "quote"],
      properties: {
        speaker: { type: "string", minLength: 1 },
        quote: { type: "string", minLength: 1 },
      },
    },
    iconic_moment: { type: "string", minLength: 1 },
    next_episode_teaser: { type: "string", minLength: 1 },
  },
} as const;

function hasVerbatimMessage(
  messages: ChatMessage[],
  speaker: string,
  quote: string,
) {
  return messages.some(
    (message) => message.speaker === speaker && message.text === quote,
  );
}

export function validateLoreResultForMessages(
  value: unknown,
  messages: ChatMessage[],
): LoreResult {
  const result = LoreResultSchema.parse(value);

  if (
    !hasVerbatimMessage(
      messages,
      result.iconic_quote.speaker,
      result.iconic_quote.quote,
    )
  ) {
    throw new Error("Iconic quote must match a source message verbatim.");
  }

  if (
    result.cast.some(
      (member) => !hasVerbatimMessage(messages, member.name, member.quote),
    )
  ) {
    throw new Error("Cast quotes must match source messages verbatim.");
  }

  return result;
}
