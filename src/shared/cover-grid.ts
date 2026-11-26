import type { FacetedUnitSpec } from 'vega-lite/types_unstable/spec/index.js';
import type { Field } from 'vega-lite/types_unstable/channeldef.js';

const COVER_ASPECT = 4 / 3;
const COVER_GAP = 6;

export interface CoverLayout {
  columns: number;
  coverWidth: number;
  coverHeight: number;
  gridHeight: number;
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

export function getBestCoverLayout(
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

export function getCoverGridSpec(
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
