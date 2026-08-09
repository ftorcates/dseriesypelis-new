import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";
import type { MediaItem } from "@/shared/lib/types";
import { Poster } from "@/features/catalog/components/poster";

export function MediaCard({ item, rank }: { item: MediaItem; rank?: number }) {
  const href = item.kind === "series" ? `/series/${item.slug}` : `/peliculas/${item.slug}`;
  return (
    <Link className="media-card" href={href}>
      <div className="media-poster-wrap">
        {rank != null && <span className="rank-number">{String(rank).padStart(2, "0")}</span>}
        <Poster title={item.title} url={item.posterUrl} tone={item.posterTone} />
        <span className="card-status">{item.status}</span>
      </div>
      <div className="media-card-copy">
        <h3>{item.title}</h3>
        <div className="media-meta">
          <span>{item.season ?? item.releaseYear ?? item.releaseDate?.slice(0, 4) ?? "Próximamente"}</span>
          <span>{item.latamPlatform ?? item.platform}</span>
          {item.score != null && <span className="score"><Star size={13} weight="fill" />{item.score.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  );
}
