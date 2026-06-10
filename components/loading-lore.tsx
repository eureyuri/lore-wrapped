"use client";

import { useEffect, useState } from "react";

const LOADING_LINES = [
  "Reading the group dynamic...",
  "Assigning suspiciously accurate roles...",
  "Calculating the chaos score...",
  "Finding the quote that changed everything...",
];

export function LoadingLore() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % LOADING_LINES.length);
    }, 1600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="loading-panel" role="status" aria-live="polite">
      <div className="loading-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loading-kicker">Building your season</p>
      <p className="loading-line" key={lineIndex}>
        {LOADING_LINES[lineIndex]}
      </p>
      <p className="loading-note">This can take a moment. Keep the tab open.</p>
    </div>
  );
}
