interface PosterProps {
  title: string;
  url?: string;
  tone: string;
  priority?: boolean;
}

export function Poster({ title, url, tone }: PosterProps) {
  return (
    <div className={`poster poster-${tone}`}>
      {/* Notion entrega URLs firmadas y temporales; se muestran directamente para no cachearlas fuera de su vigencia. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? <img src={url} alt={`Póster de ${title}`} /> : (
        <div className="poster-art" aria-label={`Póster conceptual de ${title}`}>
          <span className="poster-grain" />
          <span className="poster-orbit" />
          <span className="poster-title">{title}</span>
          <small>D&apos; SERIES Y PELIS</small>
        </div>
      )}
    </div>
  );
}
