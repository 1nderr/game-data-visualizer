import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import z, { ZodObject } from 'zod';

type CsvRow = { record: Record<string, string>; info: { lines: number } };

function validateHeaders(headers: string[], schema: ZodObject): void {
  const missing = schema.keyof().options.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw Error(`CSV is missing columns: ${missing.join(', ')}`);
  }
}

function parseRows<T extends ZodObject>(
  rows: CsvRow[],
  schema: T
): z.output<T>[] {
  let numValidationIssues = 0;

  const objects = rows
    .map((r) => {
      const result = schema.safeParse(r.record);
      if (result.success) {
        return result.data;
      }
      result.error.issues.forEach((i) => {
        numValidationIssues++;
        console.error(`[${r.info.lines}] ${i.path}\n${i.message}\n`);
      });
    })
    .filter((o) => o !== undefined);

  if (numValidationIssues > 0) {
    throw Error(`Invalid CSV data: ${numValidationIssues} issue(s)`);
  }
  return objects;
}

export function parseCsv<T extends ZodObject>(
  filePath: string,
  schema: T
): z.output<T>[] {
  if (!fs.existsSync(filePath)) {
    throw Error(`File does not exist: ${filePath}`);
  }

  if (!fs.statSync(filePath).isFile()) {
    throw Error(`Not a file: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(fileContent, {
    columns: (headers: string[]) => {
      validateHeaders(headers, schema);
      return headers;
    },
    skip_empty_lines: true,
    trim: true,
    bom: true,
    info: true,
  }) as CsvRow[];

  return parseRows(rows, schema);
}
