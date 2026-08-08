import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand"><span className="brand-mark"><Clapperboard size={19} /></span><span><strong>D&apos;</strong> SERIES <i>Y</i> PELIS</span></div>
          <p>Tu brújula para saber qué ver y cuándo verlo.</p>
        </div>
        <div className="footer-links">
          <Link href="/series">Series</Link>
          <Link href="/peliculas">Películas</Link>
          <Link href="/top-50">Top 50</Link>
        </div>
        <p className="footer-note">Datos editoriales administrados desde Notion.</p>
      </div>
    </footer>
  );
}
