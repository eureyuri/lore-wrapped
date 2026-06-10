# Lore Wrapped MVP Implementation Plan

> **For agentic workers:** Implement each package in a dedicated worktree, run its validation, and commit before reporting back.

**Goal:** Build the PRD-defined Lore Wrapped MVP: pasted chat input, secure structured OpenAI generation, and a polished nine-slide recap deck.

**Architecture:** Next.js App Router keeps the API key server-side in `app/api/generate/route.ts`. Focused `lib/` modules own parsing, schemas, prompting, sample data, and plain-text formatting; client components own input and deck interaction. Work is split by file ownership so API/domain logic and UI can proceed in parallel after the shared scaffold.

**Tech Stack:** Next.js, React, TypeScript, OpenAI JavaScript SDK, Zod, Vitest, CSS.

---

### Task 1: Scaffold and baseline

**Files:** Create the Next.js project configuration, `.gitignore`, `.env.example`, and test setup.

- [ ] Initialize Git and scaffold Next.js in the current directory without overwriting `AGENTS.md` or `PRD.md`.
- [ ] Install `openai`, `zod`, and `vitest`; add `npm test`.
- [ ] Commit the baseline so all worktrees start from the same tree.

### Task 2: Domain logic and API

**Files:** `lib/chat-parser.ts`, `lib/lore-schema.ts`, `lib/prompt.ts`, `lib/openai.ts`, `lib/sample-chat.ts`, `lib/to-plain-text.ts`, `app/api/generate/route.ts`, `tests/*.test.ts`.

- [ ] Write parser tests covering timestamps, minimum messages, speaker count, malformed-line ratio, and input length.
- [ ] Implement deterministic parsing and validation with the exact PRD error messages.
- [ ] Write schema and formatter tests covering all nine sections, item bounds, verbatim quotes, and complete plain text.
- [ ] Implement strict Zod schemas, prompt construction, sample data, quote verification, and plain-text formatting.
- [ ] Implement the Responses API route with strict structured output, one invalid-output retry, server-only configuration, and mapped errors.
- [ ] Run `npm test`, targeted TypeScript checks, and `git diff --check`; commit.

### Task 3: Landing and generation flow

**Files:** `app/page.tsx`, `components/chat-input.tsx`, `components/loading-lore.tsx`, feature documentation as needed.

- [ ] Build the landing hero, controlled textarea, helper copy, privacy note, sample loader, and live counts.
- [ ] Implement client validation, request/loading/error states, transcript preservation, retry behavior, and result handoff.
- [ ] Implement the looping loading status sequence with reduced-motion support.
- [ ] Run lint and `git diff --check`; commit.

### Task 4: Recap deck and visual system

**Files:** `components/lore-deck.tsx`, `components/lore-slide.tsx`, `app/globals.css`, `app/layout.tsx`.

- [ ] Render exactly nine story screens with responsive high-contrast treatments.
- [ ] Add Back/Next controls, progress indicator and dots, keyboard arrows, Start over, and copy feedback.
- [ ] Add 250-500ms entrance motion and disable nonessential motion under `prefers-reduced-motion`.
- [ ] Verify readability at 375px and desktop width; run lint and `git diff --check`; commit.

### Task 5: Integration and verification

- [ ] Merge delegated commits in dependency order and resolve integration issues without weakening contracts.
- [ ] Run `npm test`, `npm run lint`, and `npm run build`.
- [ ] Run `npm run dev` and use the in-app browser to verify landing, sample loading, validation, responsive layout, and a representative recap path.
- [ ] Confirm no transcript persistence and no browser-exposed API key.
- [ ] Commit integration fixes and report remaining runtime configuration needs.
