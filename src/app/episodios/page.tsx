import type { Metadata } from "next";
import { WeeklyAgenda } from "@/features/calendar/components/weekly-agenda";
import { getEpisodeWeekHub } from "@/server/notion/content";
import { DemoNotice } from "@/shared/components/demo-notice";
import { PageHero } from "@/shared/components/page-hero";

export const metadata: Metadata = { title: "Episodios" };

export default async function EpisodesPage() {
  const hub = await getEpisodeWeekHub();
  return <><PageHero eyebrow="Calendario semanal" title="Tu semana, episodio a episodio." copy="Siete días de estrenos organizados para que ninguna historia se te escape." /><DemoNotice visible={hub.isDemo} /><section className="section shell"><WeeklyAgenda events={hub.episodes} /></section></>;
}
