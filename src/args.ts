import { Command } from 'commander';

export function parseArgs(): { filePath: string } {
  const program = new Command()
    .name('data-visualizer')
    .description('A visualization tool for data')
    .argument('[filePath]', 'data filepath (csv)')
    .parse();

  const [filePath] = program.args;
  if (!filePath) {
    program.help({ error: true });
  }

  return { filePath };
}
