import type { Game } from './schema.js';
import { countBy } from './util.js';

function htmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function plotBar(data: ReadonlyMap<unknown, number>): string {
  return `<p>${htmlEscape(data.entries().toArray().join())}</p>`;
}

export function generateHtml(games: Game[]): string {
  const genreCounts = countBy(games, 'genre', 'desc');
  const genreGraph = plotBar(genreCounts);
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Game Data Visualizer</title>
      </head>
      <body>
        <div>${genreGraph}</div>
      </body>
    </html>`;
}
