import { parseArgs } from './args.js';
import { parseCsv } from './parsers/csv.js';
import { GameSchema } from './schemas/game.js';

function main(): void {
  try {
    const { filePath } = parseArgs();
    parseCsv(filePath, GameSchema);
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

main();
