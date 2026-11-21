import { Command, InvalidArgumentError } from 'commander';
import fs from 'node:fs';

function parseYear(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError('Year must be a non-negative integer');
  }
  return Number(value);
}

export function parseArgs(): {
  csvFilePath: string;
  year?: number;
  outputFilePath?: string;
} {
  const program = new Command()
    .description('A visualization tool for my games.csv data')
    .argument('[csvFilePath]', 'game data csv filepath')
    .option('-y, --year <number>', 'year to filter the data on', parseYear)
    .option('-o, --out <path>', 'output filepath')
    .parse();

  const [csvFilePath] = program.args;
  if (!csvFilePath) {
    program.help({ error: true });
  }
  if (!fs.existsSync(csvFilePath) || !fs.statSync(csvFilePath).isFile()) {
    program.error(`CSV file does not exist: ${csvFilePath}`);
  }

  const { year, out } = program.opts<{
    year?: number;
    out?: string;
  }>();

  return { csvFilePath, year, outputFilePath: out };
}
