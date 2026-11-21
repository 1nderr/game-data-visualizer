import { parse } from 'csv-parse/sync';
import { Game } from './types.js';
import fs from 'node:fs';
import { styleText } from 'node:util';

const COLUMNS = {
  title: 'Game',
  genre: 'Genre',
  system: 'System',
  purchaseMethod: 'Purchase Method',
  completed: 'Completed',
  yearPlayed: 'Year Played',
} as const satisfies Record<keyof Game, string>;

type Warn = (column: keyof Game, value: string) => void;

const SYSTEMS: readonly string[] = [
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
];

const PURCHASE_METHODS: readonly string[] = ['bought', 'neither', 'free'];

function parseSystem(value: string, warn: Warn): string {
  if (!SYSTEMS.includes(value.toLowerCase())) {
    warn('system', value);
  }
  return value;
}

function parsePurchaseMethod(value: string, warn: Warn): string {
  if (!PURCHASE_METHODS.includes(value.toLowerCase())) {
    warn('purchaseMethod', value);
  }
  return value;
}

function parseCompleted(value: string, warn: Warn): boolean {
  if (value.toLowerCase() === 'yes') {
    return true;
  } else if (value.toLowerCase() === 'no') {
    return false;
  }
  warn('completed', value);
  return false;
}

// TODO: Deduplicate this
function parseYearPlayed(value: string, warn: Warn): number {
  if (!/^\d+$/.test(value)) {
    warn('yearPlayed', value);
    return 0;
  }
  return Number(value);
}

function recordToGame(record: Record<string, string>): Game | null {
  const title = record[COLUMNS.title];
  const warnings: string[] = [];

  const warn: Warn = (column, value) => {
    warnings.push(
      `${styleText('gray', `[${title}]`)} ${styleText('yellow', 'warn')} '${value}' ${column} value is unrecognized`
    );
  };

  const game: Game = {
    title,
    genre: record[COLUMNS.genre],
    system: parseSystem(record[COLUMNS.system], warn),
    purchaseMethod: parsePurchaseMethod(record[COLUMNS.purchaseMethod], warn),
    completed: parseCompleted(record[COLUMNS.completed], warn),
    yearPlayed: parseYearPlayed(record[COLUMNS.yearPlayed], warn),
  };

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(w));
    return null;
  }

  return game;
}

function validateHeaders(headers: string[]): void {
  const missing = Object.values(COLUMNS).filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw Error(`CSV is missing columns: ${missing.join(', ')}`);
  }
}

export function parseCsv(filePath: string): Game[] {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw Error(`CSV file does not exist: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: (headers: string[]) => {
      validateHeaders(headers);
      return headers;
    },
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  return records.map((r) => recordToGame(r)).filter((g) => g !== null);
}
