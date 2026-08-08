import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  copy?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeading({ eyebrow, title, copy, href, linkLabel = "Ver todo" }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {href && <Link className="text-link" href={href}>{linkLabel}<ArrowUpRight size={17} /></Link>}
    </div>
  );
}
