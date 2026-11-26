import { parseArgs } from './args.js';
import { generateCharts } from './charts.js';
import { parseCsv } from './csv-parser.js';
import { Schema } from './schema.js';
import { writeFileSync } from 'node:fs';

try {
  const { filePath, year } = parseArgs();
  let games = parseCsv(filePath, Schema);
  games = !year ? games : games.filter((g) => g.yearPlayed === year);
  const chartsSvg = await generateCharts(games, year);
  writeFileSync('out.svg', chartsSvg, 'utf-8');
} catch (e: unknown) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
}
