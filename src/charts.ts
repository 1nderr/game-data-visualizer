import { Config, compile, TopLevelSpec } from 'vega-lite';
import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';
import { Game } from './schema.js';
import { loader, parse, View } from 'vega';
import { createRequire } from 'node:module';
import { registerFont } from 'canvas';

const PADDING = 5;

const CHART_WIDTH = 300;
const CHART_HEIGHT = 200;
const ALL_TIME_CHART_HEIGHT = 500;
const CHARTS_OVERHEAD = 80;

const FONT = 'Inconsolata';
const SUBTITLE_FONT_SIZE = 16;
const AXIS_LABEL_FONT_SIZE = 13;
const AXIS_TICK_AND_PADDING = 5 + 2;

const COVER_ASPECT = 4 / 3;
const COVER_GAP = 6;

const require = createRequire(import.meta.url);
registerFont(
  require.resolve('@fontsource/inconsolata/files/inconsolata-latin-400-normal.woff'),
  { family: FONT }
);
registerFont(
  require.resolve('@fontsource/inconsolata/files/inconsolata-latin-700-normal.woff'),
  { family: FONT, weight: 'bold' }
);

interface CoverLayout {
  columns: number;
  coverWidth: number;
  coverHeight: number;
  gridHeight: number;
}

function getChartsColumnWidth(games: Game[]): number {
  const maxLabelLength = Math.max(
    ...games.flatMap((g) => [g.genre.length, g.system.length])
  );
  return (
    CHART_WIDTH +
    (maxLabelLength * AXIS_LABEL_FONT_SIZE) / 2 +
    AXIS_TICK_AND_PADDING
  );
}

function getCoverLayout(
  count: number,
  width: number,
  columns: number
): CoverLayout {
  const coverWidth = width / columns - COVER_GAP;
  const coverHeight = coverWidth * COVER_ASPECT;
  const rows = Math.ceil(count / columns);
  return {
    columns,
    coverWidth,
    coverHeight,
    gridHeight: rows * (coverHeight + COVER_GAP),
  };
}

function getBestCoverLayout(
  count: number,
  width: number,
  targetHeight: number
): CoverLayout {
  let best = getCoverLayout(count, width, 1);
  for (let columns = 2; columns <= count; columns++) {
    const layout = getCoverLayout(count, width, columns);
    if (
      Math.abs(layout.gridHeight - targetHeight) <
      Math.abs(best.gridHeight - targetHeight)
    ) {
      best = layout;
    }
  }
  return best;
}

function getBarSpec(
  field: keyof Game,
  title: string,
  height: number,
  color: string
): FacetedUnitSpec<Field> {
  return {
    title,
    mark: { type: 'bar', color },
    width: CHART_WIDTH,
    height,
    encoding: {
      x: {
        aggregate: 'count',
        type: 'quantitative',
        title: '',
        axis: { tickMinStep: 1, format: 'd' },
      },
      y: {
        field,
        type: 'nominal',
        sort: '-x',
        title: '',
      },
    },
  };
}

function getCoverGridSpec(
  coverPaths: string[],
  { columns, coverWidth, coverHeight }: CoverLayout
): FacetedUnitSpec<Field> {
  return {
    data: {
      values: coverPaths.map((url, i) => ({
        url,
        col: i % columns,
        row: Math.floor(i / columns),
      })),
    },
    width: { step: coverWidth + COVER_GAP },
    height: { step: coverHeight + COVER_GAP },
    view: { stroke: null },
    mark: { type: 'image', width: coverWidth, height: coverHeight },
    encoding: {
      x: { field: 'col', type: 'ordinal', axis: null },
      y: { field: 'row', type: 'ordinal', axis: null },
      url: { field: 'url', type: 'nominal' },
    },
  };
}

function getSpec(
  games: Game[],
  year: number | undefined,
  chartHeight: number,
  coverGrid?: FacetedUnitSpec<Field>
): TopLevelSpec {
  const completionRate =
    (games.filter((g) => g.completed).length / games.length) * 100;
  const charts = [
    getBarSpec('genre', 'Genres', chartHeight, 'coral'),
    getBarSpec('system', 'Systems', chartHeight, 'cadetblue'),
  ];
  return {
    title: {
      text: `${year ?? 'All-Time'} Games`,
      subtitle: `${games.length} games • ${Math.round(completionRate)}% beaten`,
      anchor: 'middle',
      fontSize: 20,
      subtitleFontSize: SUBTITLE_FONT_SIZE,
    },
    padding: PADDING,
    data: {
      values: games,
    },
    hconcat: coverGrid ? [coverGrid, { vconcat: charts }] : charts,
  };
}

export async function generateCharts(
  games: Game[],
  year: number | undefined,
  coverPaths: string[]
): Promise<string> {
  let spec = getSpec(games, year, ALL_TIME_CHART_HEIGHT);

  if (year) {
    const layout = getBestCoverLayout(
      coverPaths.length,
      getChartsColumnWidth(games),
      CHART_HEIGHT * 2 + CHARTS_OVERHEAD
    );
    const chartHeight = (layout.gridHeight - CHARTS_OVERHEAD) / 2;
    spec = getSpec(
      games,
      year,
      chartHeight,
      getCoverGridSpec(coverPaths, layout)
    );
  }

  const config: Config = {
    font: FONT,
    axis: { labelFontSize: AXIS_LABEL_FONT_SIZE },
  };
  const view = new View(parse(compile(spec, { config }).spec), {
    renderer: 'none',
    loader: loader({ mode: 'file' }),
  });
  return view.toSVG();
}
