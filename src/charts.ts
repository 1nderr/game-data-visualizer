import { Config, compile, TopLevelSpec } from 'vega-lite';
import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';
import { Game } from './schema.js';
import { parse, View } from 'vega';
import { createRequire } from 'node:module';
import { registerFont } from 'canvas';

const require = createRequire(import.meta.url);
registerFont(
  require.resolve('@fontsource/inconsolata/files/inconsolata-latin-400-normal.woff'),
  { family: 'Inconsolata' }
);
registerFont(
  require.resolve('@fontsource/inconsolata/files/inconsolata-latin-700-normal.woff'),
  { family: 'Inconsolata', weight: 'bold' }
);

const PADDING = 5;
const MAX_BAR_LABEL_WIDTH = 6;

function getBarSpec(field: keyof Game, title: string): FacetedUnitSpec<Field> {
  return {
    title,
    mark: 'bar',
    width: 300,
    height: 300,
    encoding: {
      x: { aggregate: 'count', type: 'quantitative', title: '' },
      y: {
        field,
        type: 'nominal',
        sort: '-x',
        title: '',
        axis: { labelLimit: MAX_BAR_LABEL_WIDTH },
      },
    },
  };
}

export async function generateCharts(
  games: Game[],
  year: number | undefined
): Promise<string> {
  const completionRate =
    (games.filter((g) => g.completed).length / games.length) * 100;
  const vegaLiteSpec: TopLevelSpec = {
    title: {
      text: `${year ? year : 'All-Time'} Games`,
      subtitle: `${games.length} games • ${Math.round(completionRate)}% beaten`,
      anchor: 'middle',
      fontSize: 20,
      dx: MAX_BAR_LABEL_WIDTH / 2,
    },
    padding: {
      right: MAX_BAR_LABEL_WIDTH + PADDING,
      left: PADDING,
      bottom: PADDING,
      top: PADDING,
    },
    data: {
      values: games,
    },
    hconcat: [
      {
        vconcat: [
          getBarSpec('genre', 'Genres'),
          getBarSpec('system', 'Systems'),
        ],
      },
    ],
  };

  const config: Config = {
    font: 'Inconsolata',
  };
  const vegaSpec = compile(vegaLiteSpec, { config }).spec;
  const runtime = parse(vegaSpec);
  const view = new View(runtime, { renderer: 'none' });
  const svg = await view.toSVG();
  view.finalize();
  return svg;
}
