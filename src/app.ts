import { exit } from 'node:process';
import { parseArgs } from './args.js';
import { generateCharts } from './charts.js';
import { parseCsv } from './csv-parser.js';
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
  console.log(coverPaths);

  const chartsSvg = await generateCharts(games, year);
  writeFileSync('out.svg', chartsSvg, 'utf-8');
} catch (e: unknown) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
}
