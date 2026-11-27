import { TopLevelSpec } from 'vega-lite';
import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';
import { AXIS_LABEL_FONT_SIZE, renderPng } from './render.js';

export const CHART_WIDTH = 300;
const PADDING = 5;
const CHART_HEIGHT = 200;
const ALL_TIME_CHART_HEIGHT = 500;
const CHARTS_OVERHEAD = 80;
export const CHARTS_TARGET_HEIGHT = CHART_HEIGHT * 2 + CHARTS_OVERHEAD;
const SUBTITLE_FONT_SIZE = 16;
const AXIS_TICK_AND_PADDING = 5 + 2;

export function getBarSpec(
  field: string,
  title: string,
  height: number,
  color: string,
  flatten = false
): FacetedUnitSpec<Field> {
  return {
    title,
    mark: { type: 'bar', color },
    width: CHART_WIDTH,
    height,
    ...(flatten && { transform: [{ flatten: [field] }] }),
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

export function getChartsColumnWidth({ maxLabelLength }: Charts): number {
  return (
    CHART_WIDTH +
    (maxLabelLength * AXIS_LABEL_FONT_SIZE) / 2 +
    AXIS_TICK_AND_PADDING
  );
}

export interface Charts {
  title: string;
  subtitle: string;
  data: object[];
  maxLabelLength: number;
  charts: (height: number) => FacetedUnitSpec<Field>[];
}

function getSpec(
  { title, subtitle, data, charts }: Charts,
  chartHeight: number,
  coverGrid?: FacetedUnitSpec<Field>
): TopLevelSpec {
  const specs = charts(chartHeight);
  return {
    title: {
      text: title,
      subtitle,
      anchor: 'middle',
      fontSize: 20,
      subtitleFontSize: SUBTITLE_FONT_SIZE,
    },
    padding: PADDING,
    data: { values: data },
    hconcat: coverGrid ? [coverGrid, { vconcat: specs }] : specs,
  };
}

export async function renderRecap(
  charts: Charts,
  coverGrid?: { spec: FacetedUnitSpec<Field>; height: number }
): Promise<Buffer> {
  if (!coverGrid) {
    return renderPng(getSpec(charts, ALL_TIME_CHART_HEIGHT));
  }

  const chartHeight = (coverGrid.height - CHARTS_OVERHEAD) / 2;
  return renderPng(getSpec(charts, chartHeight, coverGrid.spec));
}
