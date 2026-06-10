"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LoreResult } from "@/lib/lore-schema";
import { LoreSlide } from "./lore-slide";

type LoreDeckProps = {
  result: LoreResult;
  onStartOver: () => void;
};

const SLIDE_NAMES = [
  "Season title",
  "Episode title",
  "Chat recap",
  "Meet the cast",
  "Lore stats",
  "Running jokes",
  "Iconic quote",
  "Iconic moment",
  "Next episode",
] as const;

const PALETTES = [
  "coral",
  "violet",
  "paper",
  "cyan",
  "lime",
  "pink",
  "ink",
  "orange",
  "finale",
] as const;

function formatLoreAsPlainText(result: LoreResult) {
  const cast = result.cast
    .map(
      (member) =>
        `${member.name} — ${member.role}\n${member.special_trait}\n“${member.quote}”`,
    )
    .join("\n\n");
  const stats = result.lore_stats
    .map((stat) => `${stat.label}: ${stat.value}\nEvidence: ${stat.evidence}`)
    .join("\n\n");
  const jokes = result.running_jokes.map((joke) => `- ${joke}`).join("\n");

  return [
    `LORE WRAPPED`,
    `\n1. SEASON TITLE\n${result.season_title}`,
    `\n2. EPISODE TITLE\n${result.episode_title}`,
    `\n3. CHAT RECAP\n${result.chat_recap}`,
    `\n4. CAST\n${cast}`,
    `\n5. LORE STATS\n${stats}`,
    `\n6. RUNNING JOKES\n${jokes}`,
    `\n7. ICONIC QUOTE\n“${result.iconic_quote.quote}”\n— ${result.iconic_quote.speaker}`,
    `\n8. ICONIC MOMENT\n${result.iconic_moment}`,
    `\n9. NEXT EPISODE\n${result.next_episode_teaser}`,
  ].join("\n");
}

export function LoreDeck({ result, onStartOver }: LoreDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const deckRef = useRef<HTMLDivElement>(null);
  const copyResetRef = useRef<number | null>(null);
  const fullRecap = formatLoreAsPlainText(result);

  const moveTo = useCallback((nextIndex: number) => {
    setActiveIndex(Math.min(Math.max(nextIndex, 0), SLIDE_NAMES.length - 1));
  }, []);

  useEffect(() => {
    deckRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, 8));
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current !== null) {
        window.clearTimeout(copyResetRef.current);
      }
    };
  }, []);

  async function copyFullRecap() {
    try {
      await navigator.clipboard.writeText(fullRecap);
      setCopyState("copied");
      copyResetRef.current = window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("failed");
    }
  }

  const slides = [
    <LoreSlide key="season" index={0} title="Season title" palette={PALETTES[0]}>
      <p className="slide-overline">This season on your group chat</p>
      <h1 className="slide-display">{result.season_title}</h1>
    </LoreSlide>,
    <LoreSlide key="episode" index={1} title="Episode title" palette={PALETTES[1]}>
      <p className="episode-number">EP. 01</p>
      <h1 className="slide-display">{result.episode_title}</h1>
    </LoreSlide>,
    <LoreSlide key="recap" index={2} title="Previously on..." palette={PALETTES[2]}>
      <h1 className="slide-heading">The plot, somehow</h1>
      <p className="slide-body slide-body--large">{result.chat_recap}</p>
    </LoreSlide>,
    <LoreSlide
      key="cast"
      index={3}
      title="Meet the cast"
      palette={PALETTES[3]}
      scrollable
    >
      <h1 className="slide-heading">Everyone had a role to play.</h1>
      <div className="cast-grid">
        {result.cast.map((member, index) => (
          <article className="cast-card" key={`${member.name}-${index}`}>
            <span className="card-number">0{index + 1}</span>
            <h2>{member.name}</h2>
            <p className="card-role">{member.role}</p>
            <p>{member.special_trait}</p>
            <blockquote>“{member.quote}”</blockquote>
          </article>
        ))}
      </div>
    </LoreSlide>,
    <LoreSlide
      key="stats"
      index={4}
      title="Lore stats"
      palette={PALETTES[4]}
      scrollable
    >
      <h1 className="slide-heading">Numbers with narrative weight.</h1>
      <div className="stats-grid">
        {result.lore_stats.map((stat, index) => (
          <article className="stat-card" key={`${stat.label}-${index}`}>
            <p className="stat-value">{stat.value}</p>
            <h2>{stat.label}</h2>
            <p className="stat-evidence">Why: {stat.evidence}</p>
          </article>
        ))}
      </div>
    </LoreSlide>,
    <LoreSlide key="jokes" index={5} title="Running jokes" palette={PALETTES[5]}>
      <h1 className="slide-heading">The bits survived.</h1>
      <ol className="joke-list">
        {result.running_jokes.map((joke, index) => (
          <li key={`${joke}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{joke}</p>
          </li>
        ))}
      </ol>
    </LoreSlide>,
    <LoreSlide key="quote" index={6} title="Iconic quote" palette={PALETTES[6]}>
      <p className="quote-mark" aria-hidden="true">“</p>
      <blockquote className="iconic-quote">{result.iconic_quote.quote}</blockquote>
      <p className="quote-speaker">— {result.iconic_quote.speaker}</p>
    </LoreSlide>,
    <LoreSlide key="moment" index={7} title="Iconic moment" palette={PALETTES[7]}>
      <p className="moment-stamp">The scene that defined the season</p>
      <h1 className="slide-heading slide-heading--moment">{result.iconic_moment}</h1>
    </LoreSlide>,
    <LoreSlide key="teaser" index={8} title="Next episode" palette={PALETTES[8]}>
      <p className="slide-overline">Coming up next</p>
      <h1 className="slide-heading">The lore continues.</h1>
      <p className="slide-body slide-body--large">{result.next_episode_teaser}</p>
      <div className="final-actions">
        <button className="button button--dark" type="button" onClick={copyFullRecap}>
          {copyState === "copied" ? "Copied!" : "Copy full recap"}
        </button>
        <button className="text-button text-button--dark" type="button" onClick={onStartOver}>
          Start over
        </button>
      </div>
      {copyState === "failed" ? (
        <div className="copy-fallback" role="alert">
          <p>Copy failed. Select the recap text and copy it manually.</p>
          <textarea aria-label="Full recap text" readOnly value={fullRecap} />
        </div>
      ) : null}
    </LoreSlide>,
  ];

  return (
    <main className="deck-shell">
      <div className="deck-brand" aria-label="Lore Wrapped">
        <span aria-hidden="true">LW</span>
        <p>Lore Wrapped</p>
      </div>
      <div className="deck-frame" ref={deckRef} tabIndex={-1}>
        <div className="deck-progress">
          <p aria-live="polite">
            <strong>{activeIndex + 1}</strong> / 9
          </p>
          <div className="progress-dots" aria-label="Recap slides">
            {SLIDE_NAMES.map((name, index) => (
              <button
                type="button"
                key={name}
                className={index === activeIndex ? "is-active" : ""}
                aria-label={`Go to slide ${index + 1}: ${name}`}
                aria-current={index === activeIndex ? "step" : undefined}
                onClick={() => moveTo(index)}
              />
            ))}
          </div>
        </div>

        <div className="slide-stage" key={activeIndex}>
          {slides[activeIndex]}
        </div>

        <nav className="deck-controls" aria-label="Recap navigation">
          <button
            className="nav-button nav-button--back"
            type="button"
            disabled={activeIndex === 0}
            onClick={() => moveTo(activeIndex - 1)}
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <p>{SLIDE_NAMES[activeIndex]}</p>
          <button
            className="nav-button nav-button--next"
            type="button"
            disabled={activeIndex === 8}
            onClick={() => moveTo(activeIndex + 1)}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </nav>
      </div>
    </main>
  );
}
