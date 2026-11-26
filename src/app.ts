import { parseArgs } from './args.js';
import { parseCsv } from './csv-parser.js';
import { Schema } from './schema.js';

function main(): void {
  try {
    const { filePath } = parseArgs();
    parseCsv(filePath, Schema);
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

main();
