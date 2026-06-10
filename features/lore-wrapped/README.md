# Lore Wrapped Client

This feature owns the browser experience for turning a pasted group-chat excerpt into a nine-screen recap.

## Client flow

1. `components/chat-input.tsx` renders the landing editor, live parsed counts, the temporary sample transcript, exact PRD validation messages, and the `POST /api/generate` request.
2. `components/loading-lore.tsx` loops through the four loading messages until the request settles.
3. `components/lore-deck.tsx` renders and navigates exactly nine result screens from the shared `LoreResult` type.
4. `components/lore-slide.tsx` provides the accessible slide boundary and palette hook.

The editor keeps its in-memory transcript after API errors. The client does not use cookies, local storage, or any other persistence.

## Integration points

- Replace the temporary `SAMPLE_CHAT` constant in `components/chat-input.tsx` with `SAMPLE_CHAT` from `lib/sample-chat.ts` when the domain work lands.
- Replace the local `formatLoreAsPlainText` function in `components/lore-deck.tsx` with the shared formatter from `lib/to-plain-text.ts` when available.
- The API contract is `POST /api/generate` with `{ chatText }`, returning `LoreResult` on success.
