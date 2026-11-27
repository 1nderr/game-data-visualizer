import { TopLevelSpec } from 'vega-lite';
import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';
import { getBestCoverLayout, getCoverGridSpec } from '../shared/cover-grid.js';
import { AXIS_LABEL_FONT_SIZE, renderPng } from '../shared/render.js';
import { Book } from './types.js';

const PADDING = 5;

const CHART_WIDTH = 300;
const CHART_HEIGHT = 200;
const ALL_TIME_CHART_HEIGHT = 500;
const CHARTS_OVERHEAD = 80;

const SUBTITLE_FONT_SIZE = 16;
const AXIS_TICK_AND_PADDING = 5 + 2;

function getChartsColumnWidth(books: Book[]): number {
  const maxLabelLength = Math.max(
    ...books.flatMap((b) => b.tags.map((t) => t.length))
  );
  return (
    CHART_WIDTH +
    (maxLabelLength * AXIS_LABEL_FONT_SIZE) / 2 +
    AXIS_TICK_AND_PADDING
  );
}

function getBarSpec(
  field: keyof Book,
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
  books: Book[],
  year: number | undefined,
  chartHeight: number,
  coverGrid?: FacetedUnitSpec<Field>
): TopLevelSpec {
  const completionRate =
    (books.filter((b) => b.status === 'finished').length / books.length) * 100;

  const charts = [getBarSpec('tags', 'Genres', chartHeight, 'mediumpurple')];

  return {
    title: {
      text: `${year ?? 'All-Time'} Books`,
      subtitle: `${books.length} books • ${Math.round(completionRate)}% finished`,
      anchor: 'middle',
      fontSize: 20,
      subtitleFontSize: SUBTITLE_FONT_SIZE,
    },
    padding: PADDING,
    data: {
      values: books,
    },
    hconcat: coverGrid ? [coverGrid, { vconcat: charts }] : charts,
  };
}

export async function generateCharts(
  books: Book[],
  year: number | undefined
): Promise<Buffer> {
  let spec = getSpec(books, year, ALL_TIME_CHART_HEIGHT);

  if (year) {
    const layout = getBestCoverLayout(
      books.length,
      getChartsColumnWidth(books),
      CHART_HEIGHT * 2 + CHARTS_OVERHEAD
    );
    const chartHeight = (layout.gridHeight - CHARTS_OVERHEAD) / 2;
    spec = getSpec(
      books,
      year,
      chartHeight,
      getCoverGridSpec(
        books.map((b) => b.coverPath).filter((c) => c !== null),
        layout
      )
    );
  }

  return renderPng(spec);
}
