import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import z from 'zod';

const SYSTEMS = [
  'pc',
  'nintendo entertainment system',
  'super nintendo entertainment system',
  'nintendo 64',
  'nintendo gamecube',
  'wii',
  'wii u',
  'nintendo switch',
  'nintendo switch 2',
  'game boy',
  'game boy color',
  'game boy advance',
  'nintendo ds',
  'nintendo 3ds',
  'playstation',
  'playstation 2',
  'playstation 3',
  'playstation portable',
  'sega genesis',
] as const;
const PURCHASE_METHODS = ['bought', 'neither', 'free'] as const;

const Row = z.object({
  title: z.string().toLowerCase(),
  genre: z.string().toLowerCase(),
  system: z.string().toLowerCase().pipe(z.enum(SYSTEMS)),
  purchaseMethod: z.string().toLowerCase().pipe(z.enum(PURCHASE_METHODS)),
  completed: z.stringbool({ truthy: ['true'], falsy: ['false'] }),
  yearPlayed: z.coerce.number().int().min(1970).max(2200),
});

export type Game = z.infer<typeof Row>;

function validateHeaders(headers: string[]): void {
  const missing = Row.keyof().options.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw Error(`CSV is missing columns: ${missing.join(', ')}`);
  }
}

function rowsToGames(rows: Record<string, string>[]): Game[] {
  let numValidationIssues = 0;

  const games = rows
    .map((r) => {
      const result = Row.safeParse(r);
      if (result.success) {
        return result.data;
      }
      result.error.issues.forEach((i) => {
        numValidationIssues++;
        console.error(`[${r.title}] ${i.path}\n${i.message}\n`);
      });
    })
    .filter((g) => g !== undefined);

  if (numValidationIssues > 0) {
    throw Error(`Invalid CSV data: ${numValidationIssues} issue(s)`);
  }
  return games;
}

export function parseCsv(filePath: string): Game[] {
  if (!fs.existsSync(filePath)) {
    throw Error(`File does not exist: ${filePath}`);
  }

  if (!fs.statSync(filePath).isFile()) {
    throw Error(`Not a file: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(fileContent, {
    columns: (headers: string[]) => {
      validateHeaders(headers);
      return headers;
    },
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  return rowsToGames(rows);
}
