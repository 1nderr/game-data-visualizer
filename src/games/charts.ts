import { Charts, getBarSpec } from '../shared/recap.js';
import { Game } from './schema.js';

export function generateCharts(
  games: Game[],
  year: number | undefined
): Charts {
  const completionRate =
    (games.filter((g) => g.completed).length / games.length) * 100;

  return {
    title: `${year ?? 'All-Time'} Games`,
    subtitle: `${games.length} games • ${Math.round(completionRate)}% beaten`,
    data: games,
    maxLabelLength: Math.max(
      ...games.flatMap((g) => [g.genre.length, g.system.length])
    ),
    charts: (height) => [
      getBarSpec('genre', 'Genres', height, 'coral'),
      getBarSpec('system', 'Systems', height, 'cadetblue'),
    ],
  };
}
