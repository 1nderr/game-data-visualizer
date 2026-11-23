import { parseArgs } from './args.js';
import { parseCsv } from './csv-parser.js';
import { generateHtml } from './html.js';
import { Schema } from './schema.js';

function main(): void {
  try {
    const { filePath } = parseArgs();
    const games = parseCsv(filePath, Schema);
    const html = generateHtml(games);
    console.log(html);
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

main();
