import { exit } from 'node:process';
import { parseArgs } from '../shared/args.js';
import { generateCharts } from './charts.js';
import { getChartsColumnWidth, renderRecap } from '../shared/recap.js';
import { getCoverGrid } from '../shared/cover-grid.js';
import { parseCsv } from './csv.js';
import { downloadCovers } from './igdb.js';
import { Schema } from './schema.js';
import { writeFileSync } from 'node:fs';

try {
  const { filePath, year } = parseArgs();

  let games = parseCsv(filePath, Schema);
  games = year ? games.filter((g) => g.yearPlayed === year) : games;
  if (games.length === 0) {
    console.log('No games found');
    exit(1);
  }

  const coverPaths = year ? await downloadCovers(games) : [];
  const charts = generateCharts(games, year);
  const coverGrid = getCoverGrid(coverPaths, getChartsColumnWidth(charts));

  const png = await renderRecap(charts, coverGrid);
  writeFileSync('games.png', png);
} catch (e: unknown) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
}
