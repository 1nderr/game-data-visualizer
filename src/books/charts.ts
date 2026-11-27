import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';
import { CHART_WIDTH, Charts, getBarSpec } from '../shared/recap.js';
import { Book } from './db.js';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getPagesPerPeriod(
  books: Book[],
  year: number | undefined
): { period: string; pages: number }[] {
  const periodOf = (d: Date) =>
    year ? MONTHS[d.getUTCMonth()] : String(d.getUTCFullYear());
  const dated = books.filter((b) => b.finishedDate !== null);
  const periods = year
    ? MONTHS
    : [...new Set(dated.map((b) => periodOf(b.finishedDate as Date)))].sort();

  return periods.map((period) => ({
    period,
    pages: dated
      .filter((b) => periodOf(b.finishedDate as Date) === period)
      .reduce((sum, b) => sum + (b.pages ?? 0), 0),
  }));
}

function getPagesSpec(
  values: { period: string; pages: number }[],
  title: string,
  height: number,
  color: string
): FacetedUnitSpec<Field> {
  return {
    title,
    data: { values },
    mark: { type: 'bar', color },
    width: CHART_WIDTH,
    height,
    encoding: {
      x: {
        field: 'period',
        type: 'ordinal',
        sort: null,
        title: '',
        axis: { labelAngle: 0 },
      },
      y: {
        field: 'pages',
        type: 'quantitative',
        title: '',
        axis: { format: ',d' },
      },
    },
  };
}

export function generateCharts(
  books: Book[],
  year: number | undefined
): Charts {
  const completionRate =
    (books.filter((b) => b.status === 'finished').length / books.length) * 100;
  const totalPages = books.reduce((sum, b) => sum + (b.pages ?? 0), 0);

  return {
    title: `${year ?? 'All-Time'} Books`,
    subtitle: `${books.length} books • ${totalPages.toLocaleString('en-US')} pages • ${Math.round(completionRate)}% finished`,
    data: books,
    maxLabelLength: Math.max(
      ...books.flatMap((b) => b.tags.map((t) => t.length))
    ),
    charts: (height) => [
      getPagesSpec(
        getPagesPerPeriod(books, year),
        year ? 'Pages per Month' : 'Pages per Year',
        height,
        'coral'
      ),
      getBarSpec('tags', 'Genres', height, 'cadetblue', true),
    ],
  };
}
