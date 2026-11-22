import { Command, InvalidArgumentError } from 'commander';

function parseYear(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError('Year must be a non-negative integer');
  }
  return Number(value);
}

export function parseArgs(): {
  filePath: string;
  year?: number;
  outputFilePath?: string;
} {
  const program = new Command()
    .description('A visualization tool for data')
    .argument('[filePath]', 'data filepath (csv)')
    .option('-y, --year <number>', 'year to filter the data on', parseYear)
    .option('-o, --out <path>', 'output filepath')
    .parse();

  const [filePath] = program.args;
  if (!filePath) {
    program.help({ error: true });
  }

  const { year, out } = program.opts<{
    year?: number;
    out?: string;
  }>();

  return { filePath: filePath, year, outputFilePath: out };
}
