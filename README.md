# D' Series y Pelis

Plataforma editorial de series y películas, construida con Next.js y alimentada por Notion.

## Desarrollo local

1. Instala dependencias con `npm install`.
2. Copia `.env.example` como `.env.local`.
3. Añade la clave de una integración interna de Notion.
4. Comparte con esa integración las fuentes originales de Series y Episodios.
5. Ejecuta `npm run dev`.

Si no hay credenciales, la aplicación utiliza un catálogo de demostración para permitir el desarrollo visual.

## Fuentes de Notion

- `NOTION_SERIES_DATA_SOURCE_ID`: catálogo principal de series.
- `NOTION_EPISODES_DATA_SOURCE_ID`: calendario de episodios.
- `NOTION_MOVIES_DATA_SOURCE_ID`: catálogo de películas; puede añadirse más adelante sin cambiar la interfaz.

Las consultas se ejecutan exclusivamente en el servidor y se revalidan cada 15 minutos. La clave de Notion nunca se expone al navegador.

## Rutas

- `/` — portada editorial combinada.
- `/series` y `/series/[slug]` — catálogo y fichas.
- `/episodios` — calendario semanal.
- `/estrenos` — calendario mensual de estrenos.
- `/finales` — calendario mensual de finales.
- `/top-50` — ranking por IMDb.
- `/peliculas` y `/peliculas/[slug]` — hub y fichas de películas.
- `/peliculas/calendario` — calendario de estrenos y adiciones, filtrable por distribución.
- `/peliculas/top-50` — Top 50 IMDb filtrable por año original de lanzamiento.

La fuente de películas se consulta por intención: próximos movimientos para el hub, año actual y siguiente para el calendario, cincuenta resultados para el ranking y una sola página para cada ficha. Esto evita descargar el catálogo completo en cada visita.
