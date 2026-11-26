import { Config, compile, TopLevelSpec } from 'vega-lite';
import { loader, parse, View } from 'vega';
import { createRequire } from 'node:module';
import { Canvas, registerFont } from 'canvas';

const SCALE_FACTOR = 3;

const FONT = 'Inconsolata';
export const AXIS_LABEL_FONT_SIZE = 13;

const require = createRequire(import.meta.url);
registerFont(
  require.resolve('@fontsource/inconsolata/files/inconsolata-latin-400-normal.woff'),
  { family: FONT }
);
registerFont(
  require.resolve('@fontsource/inconsolata/files/inconsolata-latin-700-normal.woff'),
  { family: FONT, weight: 'bold' }
);

export async function renderPng(spec: TopLevelSpec): Promise<Buffer> {
  const config: Config = {
    font: FONT,
    axis: { labelFontSize: AXIS_LABEL_FONT_SIZE },
  };
  const view = new View(parse(compile(spec, { config }).spec), {
    renderer: 'none',
    loader: loader({ mode: 'file' }),
  });
  const canvas = (await view.toCanvas(SCALE_FACTOR)) as unknown as Canvas;
  return canvas.toBuffer('image/png');
}
