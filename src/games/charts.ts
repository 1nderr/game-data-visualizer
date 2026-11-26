import { TopLevelSpec } from 'vega-lite';
import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';
import { Game } from './schema.js';
import { getBestCoverLayout, getCoverGridSpec } from '../shared/cover-grid.js';
import { AXIS_LABEL_FONT_SIZE, renderPng } from '../shared/render.js';

const PADDING = 5;

const CHART_WIDTH = 300;
const CHART_HEIGHT = 200;
const ALL_TIME_CHART_HEIGHT = 500;
const CHARTS_OVERHEAD = 80;

const SUBTITLE_FONT_SIZE = 16;
const AXIS_TICK_AND_PADDING = 5 + 2;

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
): Promise<Buffer> {
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

  return renderPng(spec);
}
