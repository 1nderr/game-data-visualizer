import { Command, InvalidArgumentError } from 'commander';

function parseYear(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError('Year must be a non-negative integer');
  }
  return Number(value);
}

export function parseArgs(): { filePath: string; year?: number } {
  const program = new Command()
    .name('game-data-visualizer')
    .description('A visualization tool for my games.csv data')
    .argument('[filePath]', 'game data csv filepath')
    .option('-y, --year <number>', 'year to filter the data on', parseYear)
    .parse();

  const [filePath] = program.args;
  if (!filePath) {
    program.help({ error: true });
  }

  const { year } = program.opts<{
    year?: number;
  }>();

  return { filePath, year };
}
