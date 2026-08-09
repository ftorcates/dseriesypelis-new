import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-masthead"><strong>D&apos;</strong><span>SERIES<br />Y PELIS</span></div>
        <p>Calendarios, rankings y cultura audiovisual.<br />Actualizado directamente desde Notion.</p>
        <div className="footer-links">
          <Link href="/series">Series</Link><Link href="/episodios">Episodios</Link><Link href="/estrenos">Estrenos</Link>
          <Link href="/peliculas">Películas</Link><Link href="/top-50">Top 50</Link>
        </div>
        <p className="footer-note">D&apos; SERIES Y PELIS · LA GUÍA CULTURAL</p>
      </div>
    </footer>
  );
}
