import type { ReactNode } from "react";

type LoreSlideProps = {
  index: number;
  title: string;
  palette: string;
  children: ReactNode;
  scrollable?: boolean;
};

export function LoreSlide({
  index,
  title,
  palette,
  children,
  scrollable = false,
}: LoreSlideProps) {
  return (
    <section
      className={`lore-slide lore-slide--${palette}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of 9: ${title}`}
    >
      <div className="slide-art slide-art--orbit" aria-hidden="true" />
      <div className="slide-art slide-art--burst" aria-hidden="true" />
      <div
        className={`slide-content${scrollable ? " slide-content--scrollable" : ""}`}
      >
        <p className="slide-label">{title}</p>
        {children}
      </div>
    </section>
  );
}
