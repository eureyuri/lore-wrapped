"use client";

import { useMemo, useRef, useState } from "react";
import type { LoreResult } from "@/lib/lore-schema";
import { LoadingLore } from "./loading-lore";
import { LoreDeck } from "./lore-deck";

// Temporary integration point: replace with SAMPLE_CHAT from lib/sample-chat.ts
// when the domain/API worktree lands that owned module.
const SAMPLE_CHAT = `[7:02 PM] Maya: one more song before we leave
Kevin: wait where are you guys
Alex: still at my apartment because Maya said one more song
Maya: one more song is a flexible unit of time
Priya: I am outside in shoes that cannot survive weather
Kevin: outside where
Alex: incredible opening question
Maya: put on Queen
Priya: we have played Queen three times
Maya: and yet morale remains fragile
Kevin: I found a blue door is that it
Alex: our building has a red door
Priya: Kevin please look at the address
Kevin: I did spiritually
Maya: new plan rooftop karaoke
Alex: that is not a smaller plan
Priya: I am moving from dramatic to biblical
Kevin: the blue door person waved at me
Maya: invite them
Alex: do not invite the blue door person
Priya: one more song and I become weather
Maya: noted but consider Bohemian Rhapsody
Kevin: wait I am on the right street now
Alex: season finale energy
Priya: I can see Kevin walking the wrong direction
Kevin: no you cannot
Priya: you are wearing a yellow jacket
Kevin: okay rude
Maya: new plan we intercept Kevin as a group
Alex: that is just leaving the apartment
Maya: exactly the plan is working
Priya: one more song has lasted forty minutes
Kevin: I found the red door
Alex: character development
Kevin: it is locked
Priya: the door is not locked you are pulling
Kevin: huge if true
Maya: everybody freeze the chorus is coming
Alex: we are never making the reservation
Priya: the reservation has become a historical document
Kevin: I am inside
Maya: perfect one more song`;

const LINE_PATTERN = /^(?:\[[^\]]+\]\s*)?([^:\n]{1,40}):\s*(.+)$/;

type Counts = { messages: number; speakers: number; matchRatio: number };

function getCounts(chatText: string): Counts {
  const lines = chatText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const speakers = new Set<string>();
  let messages = 0;

  for (const line of lines) {
    const match = line.match(LINE_PATTERN);
    if (match) {
      messages += 1;
      speakers.add(match[1].trim().toLocaleLowerCase());
    }
  }

  return {
    messages,
    speakers: speakers.size,
    matchRatio: lines.length === 0 ? 0 : messages / lines.length,
  };
}

function validateChat(chatText: string) {
  const trimmed = chatText.trim();
  if (!trimmed) return "Paste a group chat first.";
  if (trimmed.length > 12_000) {
    return "Keep the excerpt under 12,000 characters for this demo.";
  }

  const counts = getCounts(trimmed);
  if (counts.matchRatio < 0.6) {
    return "Use one message per line in the format Name: message.";
  }
  if (counts.messages < 6) {
    return "Add at least 6 messages so there is enough lore to work with.";
  }
  if (counts.speakers < 2) {
    return "This needs at least 2 speakers to feel like a group chat.";
  }

  return null;
}

function responseError(status: number, payload: unknown) {
  const serverMessage =
    payload && typeof payload === "object" && "error" in payload
      ? (payload as { error?: unknown }).error
      : undefined;

  if (status === 400 && typeof serverMessage === "string") return serverMessage;
  if (status === 429) return "Too many recaps at once. Wait a moment and try again.";
  if (
    serverMessage === "This chat could not be turned into a recap. Try a different excerpt." ||
    serverMessage === "The lore came back scrambled. Please try again."
  ) {
    return serverMessage;
  }

  return "Lore generation failed. Your chat is still in the editor, so you can retry.";
}

export function ChatInput() {
  const [chatText, setChatText] = useState("");
  const [result, setResult] = useState<LoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const counts = useMemo(() => getCounts(chatText), [chatText]);

  function loadSample() {
    setChatText(SAMPLE_CHAT);
    setError(null);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function generateLore() {
    const validationError = validateChat(chatText);
    if (validationError) {
      setError(validationError);
      textareaRef.current?.focus();
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatText: chatText.trim() }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(responseError(response.status, payload));
        return;
      }

      setResult(payload as LoreResult);
    } catch {
      setError("Lore generation failed. Your chat is still in the editor, so you can retry.");
    } finally {
      setIsLoading(false);
    }
  }

  function startOver() {
    setResult(null);
    setChatText("");
    setError(null);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  if (result) {
    return <LoreDeck result={result} onStartOver={startOver} />;
  }

  return (
    <main className="landing-shell">
      <header className="site-header">
        <a className="wordmark" href="#main-input" aria-label="Lore Wrapped home">
          <span aria-hidden="true">LW</span>
          Lore Wrapped
        </a>
        <p>No accounts. No saved chats.</p>
      </header>

      <div className="landing-grid">
        <section className="hero-copy" aria-labelledby="page-title">
          <div className="hero-art hero-art--dots" aria-hidden="true" />
          <div className="hero-art hero-art--orbit" aria-hidden="true" />
          <h1 id="page-title">
            Your group chat is a TV show. <em>Generate the season recap.</em>
          </h1>
          <p className="hero-summary">
            Paste the chaos. Get the cast, plot, running jokes, and quote that
            changed everything.
          </p>
          <p className="hero-index" aria-hidden="true">9 screens / 1 legendary season</p>
        </section>

        <section className="input-panel" id="main-input" aria-label="Group chat input">
          {isLoading ? (
            <LoadingLore />
          ) : (
            <>
              <div className="input-heading">
                <div>
                  <p className="utility-label">Your transcript</p>
                  <h2>Drop the lore here.</h2>
                </div>
                <button className="text-button" type="button" onClick={loadSample}>
                  Load sample chat
                </button>
              </div>

              <label className="sr-only" htmlFor="chat-text">Group chat transcript</label>
              <textarea
                ref={textareaRef}
                id="chat-text"
                value={chatText}
                maxLength={12_001}
                onChange={(event) => {
                  setChatText(event.target.value);
                  if (error) setError(null);
                }}
                placeholder={`Maya: one more song\nKevin: wait where are you guys\nAlex: this is already going well`}
                aria-describedby="input-help privacy-note input-error"
                aria-invalid={Boolean(error)}
              />

              <div className="input-meta">
                <p id="input-help">
                  <strong>Format:</strong> one message per line, starting with Name:
                </p>
                <p className={chatText.length > 12_000 ? "is-over-limit" : ""}>
                  {chatText.length.toLocaleString()} / 12,000
                </p>
              </div>

              <div className="count-strip" aria-live="polite">
                <div>
                  <span aria-hidden="true">◉</span>
                  <p><strong>{counts.speakers}</strong> speakers</p>
                </div>
                <div>
                  <span aria-hidden="true">↳</span>
                  <p><strong>{counts.messages}</strong> messages</p>
                </div>
              </div>

              <div className="submit-row">
                <button className="button button--primary" type="button" onClick={generateLore}>
                  Generate Lore <span aria-hidden="true">→</span>
                </button>
                <p id="privacy-note">
                  Your pasted chat is sent to the AI provider to generate this recap.
                  It is not saved by this app.
                </p>
              </div>

              <p className="form-error" id="input-error" role="alert">
                {error ?? ""}
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
