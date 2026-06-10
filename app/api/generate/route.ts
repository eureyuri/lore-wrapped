import { NextResponse } from "next/server";

import { ChatValidationError, parseChat } from "@/lib/chat-parser";
import {
  generateLore,
  InvalidLoreOutputError,
  isRateLimitError,
  LoreRefusalError,
  MissingOpenAIConfigurationError,
} from "@/lib/openai";

const GENERIC_ERROR =
  "Lore generation failed. Your chat is still in the editor, so you can retry.";

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { chatText?: unknown };
    const chatText = typeof body.chatText === "string" ? body.chatText : "";
    const parsed = parseChat(chatText);
    const lore = await generateLore(parsed.messages);

    return NextResponse.json(lore);
  } catch (error) {
    if (error instanceof ChatValidationError) {
      return errorResponse(error.message, 400);
    }

    if (isRateLimitError(error)) {
      return errorResponse(
        "Too many recaps at once. Wait a moment and try again.",
        429,
      );
    }

    if (error instanceof LoreRefusalError) {
      return errorResponse(
        "This chat could not be turned into a recap. Try a different excerpt.",
        422,
      );
    }

    if (error instanceof InvalidLoreOutputError) {
      return errorResponse(
        "The lore came back scrambled. Please try again.",
        502,
      );
    }

    if (error instanceof MissingOpenAIConfigurationError) {
      const message =
        process.env.NODE_ENV === "development" ? error.message : GENERIC_ERROR;
      return errorResponse(message, 500);
    }

    return errorResponse(GENERIC_ERROR, 500);
  }
}
