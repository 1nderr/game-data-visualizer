import { Command } from 'commander';

export function parseArgs(): { filePath: string } {
  const program = new Command()
    .name('game-data-visualizer')
    .description('A visualization tool for my games.csv data')
    .argument('[filePath]', 'game data csv filepath')
    .parse();

  const [filePath] = program.args;
  if (!filePath) {
    program.help({ error: true });
  }

  return { filePath };
}
