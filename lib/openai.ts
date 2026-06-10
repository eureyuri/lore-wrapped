import OpenAI from "openai";

import type { ChatMessage } from "@/lib/chat-parser";
import {
  LoreResultJsonSchema,
  validateLoreResultForMessages,
  type LoreResult,
} from "@/lib/lore-schema";
import {
  buildTranscriptInput,
  LORE_SYSTEM_INSTRUCTIONS,
} from "@/lib/prompt";

type LoreResponseRequest = {
  model: string;
  instructions: string;
  input: Array<{
    role: "user";
    content: Array<{ type: "input_text"; text: string }>;
  }>;
  temperature: number;
  text: {
    format: {
      type: "json_schema";
      name: "lore_result";
      strict: true;
      schema: typeof LoreResultJsonSchema;
    };
  };
};

export type ResponsesClient = {
  responses: {
    create(request: LoreResponseRequest): Promise<unknown>;
  };
};

type GenerateLoreOptions = {
  client?: ResponsesClient;
  model?: string;
};

export class MissingOpenAIConfigurationError extends Error {
  constructor(readonly variable: "OPENAI_API_KEY" | "OPENAI_MODEL") {
    super(`${variable} is not configured.`);
    this.name = "MissingOpenAIConfigurationError";
  }
}

export class LoreRefusalError extends Error {
  constructor() {
    super("The model refused to generate a recap.");
    this.name = "LoreRefusalError";
  }
}

export class InvalidLoreOutputError extends Error {
  constructor() {
    super("The model returned invalid lore output.");
    this.name = "InvalidLoreOutputError";
  }
}

function configuredClient(): ResponsesClient {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new MissingOpenAIConfigurationError("OPENAI_API_KEY");
  }

  return new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: 45_000,
  }) as unknown as ResponsesClient;
}

function getModel(model?: string) {
  const configuredModel = model ?? process.env.OPENAI_MODEL;

  if (!configuredModel) {
    throw new MissingOpenAIConfigurationError("OPENAI_MODEL");
  }

  return configuredModel;
}

function isRefusal(response: unknown): boolean {
  if (!response || typeof response !== "object" || !("output" in response)) {
    return false;
  }

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return false;
  }

  return output.some((item) => {
    if (!item || typeof item !== "object" || !("content" in item)) {
      return false;
    }

    const content = (item as { content?: unknown }).content;
    return (
      Array.isArray(content) &&
      content.some(
        (part) =>
          Boolean(part) &&
          typeof part === "object" &&
          "type" in part &&
          part.type === "refusal",
      )
    );
  });
}

function outputText(response: unknown): string | null {
  if (
    response &&
    typeof response === "object" &&
    "output_text" in response &&
    typeof response.output_text === "string"
  ) {
    return response.output_text;
  }

  return null;
}

function parseResponse(response: unknown, messages: ChatMessage[]): LoreResult {
  if (isRefusal(response)) {
    throw new LoreRefusalError();
  }

  const text = outputText(response);
  if (!text) {
    throw new InvalidLoreOutputError();
  }

  try {
    return validateLoreResultForMessages(JSON.parse(text), messages);
  } catch (error) {
    if (error instanceof LoreRefusalError) {
      throw error;
    }
    throw new InvalidLoreOutputError();
  }
}

export function isRateLimitError(error: unknown) {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 429
  );
}

export async function generateLore(
  messages: ChatMessage[],
  options: GenerateLoreOptions = {},
): Promise<LoreResult> {
  const client = options.client ?? configuredClient();
  const request: LoreResponseRequest = {
    model: getModel(options.model),
    instructions: LORE_SYSTEM_INSTRUCTIONS,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildTranscriptInput(messages),
          },
        ],
      },
    ],
    temperature: 0.4,
    text: {
      format: {
        type: "json_schema",
        name: "lore_result",
        strict: true,
        schema: LoreResultJsonSchema,
      },
    },
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await client.responses.create(request);

    try {
      return parseResponse(response, messages);
    } catch (error) {
      if (error instanceof LoreRefusalError) {
        throw error;
      }

      if (attempt === 1) {
        throw new InvalidLoreOutputError();
      }
    }
  }

  throw new InvalidLoreOutputError();
}
