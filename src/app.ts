import { parseArgs } from './args.js';
import { parseCsv } from './csv.js';

function main(): void {
  try {
    const { csvFilePath, year, outputFilePath } = parseArgs();
    parseCsv(csvFilePath);
    console.log(year, outputFilePath);
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

main();
