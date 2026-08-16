import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";
import type { MediaItem } from "@/shared/lib/types";
import { Poster } from "@/features/catalog/components/poster";

export function MediaCard({ item, rank }: { item: MediaItem; rank?: number }) {
  const href = item.kind === "series" ? `/series/${item.slug}` : `/peliculas/${item.slug}`;
  const seriesStatuses = item.kind === "series" ? [
    ...(item.renewalStatus ? [{ label: item.renewalStatus, field: "Renovación", className: "" }] : []),
    ...(item.airingStatus ? [{ label: item.airingStatus, field: "Estado de emisión", className: "card-status-airing" }] : []),
  ] : [];
  const cardStatuses = seriesStatuses.length ? seriesStatuses : [{ label: item.status, field: "Estado", className: "" }];

  return (
    <Link className="media-card" href={href}>
      <div className="media-poster-wrap">
        {rank != null && <span className="rank-number">{String(rank).padStart(2, "0")}</span>}
        <Poster title={item.title} url={item.posterUrl} tone={item.posterTone} />
        <div className="card-statuses">
          {cardStatuses.map((status) => <span className={`card-status ${status.className}`} title={`${status.field}: ${status.label}`} key={status.field}>{status.label}</span>)}
        </div>
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
