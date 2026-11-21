import { parseArgs } from './args.js';

function main(): void {
  const { csvFilePath, year, outputFilePath } = parseArgs();
  console.log(csvFilePath, year, outputFilePath);
}

main();
