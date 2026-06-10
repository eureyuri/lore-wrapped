export const CHAT_VALIDATION_MESSAGES = {
  empty: "Paste a group chat first.",
  tooShort: "Add at least 6 messages so there is enough lore to work with.",
  oneSpeaker: "This needs at least 2 speakers to feel like a group chat.",
  wrongShape: "Use one message per line in the format Name: message.",
  tooLong: "Keep the excerpt under 12,000 characters for this demo.",
} as const;

export type ChatValidationMessage =
  (typeof CHAT_VALIDATION_MESSAGES)[keyof typeof CHAT_VALIDATION_MESSAGES];

export type ChatMessage = {
  speaker: string;
  text: string;
};

export type ParsedChat = {
  messages: ChatMessage[];
  speakers: string[];
  nonEmptyLineCount: number;
  matchedLineCount: number;
};

export class ChatValidationError extends Error {
  readonly status = 400;

  constructor(message: ChatValidationMessage) {
    super(message);
    this.name = "ChatValidationError";
  }
}

const MAX_CHAT_LENGTH = 12_000;
const MIN_MESSAGES = 6;
const MIN_MATCH_RATIO = 0.6;
const TIMESTAMP_PREFIX = /^\[[^\]\r\n]{1,40}\]\s*/;

function parseLine(line: string): ChatMessage | null {
  const withoutTimestamp = line.trim().replace(TIMESTAMP_PREFIX, "");
  const separatorIndex = withoutTimestamp.indexOf(":");

  if (separatorIndex < 1) {
    return null;
  }

  const speaker = withoutTimestamp.slice(0, separatorIndex).trim();
  const text = withoutTimestamp.slice(separatorIndex + 1).trim();

  if (speaker.length < 1 || speaker.length > 40 || text.length === 0) {
    return null;
  }

  return { speaker, text };
}

function inspectChat(chatText: string): ParsedChat {
  const lines = chatText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const messages = lines
    .map(parseLine)
    .filter((message): message is ChatMessage => message !== null);
  const speakers = [...new Set(messages.map((message) => message.speaker))];

  return {
    messages,
    speakers,
    nonEmptyLineCount: lines.length,
    matchedLineCount: messages.length,
  };
}

export function getChatCounts(chatText: string) {
  const { messages, speakers } = inspectChat(chatText);

  return {
    messages: messages.length,
    speakers: speakers.length,
  };
}

export function parseChat(chatText: string): ParsedChat {
  const trimmed = chatText.trim();

  if (!trimmed) {
    throw new ChatValidationError(CHAT_VALIDATION_MESSAGES.empty);
  }

  if (chatText.length > MAX_CHAT_LENGTH) {
    throw new ChatValidationError(CHAT_VALIDATION_MESSAGES.tooLong);
  }

  const parsed = inspectChat(trimmed);
  const matchRatio = parsed.matchedLineCount / parsed.nonEmptyLineCount;

  if (matchRatio < MIN_MATCH_RATIO) {
    throw new ChatValidationError(CHAT_VALIDATION_MESSAGES.wrongShape);
  }

  if (parsed.messages.length < MIN_MESSAGES) {
    throw new ChatValidationError(CHAT_VALIDATION_MESSAGES.tooShort);
  }

  if (parsed.speakers.length < 2) {
    throw new ChatValidationError(CHAT_VALIDATION_MESSAGES.oneSpeaker);
  }

  return parsed;
}
