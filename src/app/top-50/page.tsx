import type { Metadata } from "next";
import { MediaCard } from "@/features/catalog/components/media-card";
import { getSeriesRankingHub } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Top 50" };

export default async function TopPage() {
  const hub = await getSeriesRankingHub();
  const ranking = hub.series;
  return <><PageHero eyebrow="Ranking IMDb" title="Las 50 que están por encima del ruido." copy="Una selección dinámica basada en las puntuaciones de IMDb y en las series que realmente sigues." /><DemoNotice visible={hub.isDemo} /><section className="section shell"><div className="ranking-intro"><span>Actualizado desde Notion</span><strong>{ranking.length} títulos clasificados</strong></div><div className="media-grid catalog-grid">{ranking.map((item, index) => <MediaCard item={item} rank={index + 1} key={item.id} />)}</div></section></>;
}
