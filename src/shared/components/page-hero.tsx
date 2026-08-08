import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero-orb" />
      <div className="shell page-hero-inner">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
        {action}
      </div>
    </section>
  );
}
