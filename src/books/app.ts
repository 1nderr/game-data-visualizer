import { exit } from 'process';
import { parseArgs } from '../shared/args.js';
import { getBooks } from './db.js';
import { generateCharts } from './charts.js';
import { writeFileSync } from 'fs';

try {
  const { filePath, year } = parseArgs();

  let books = await getBooks(filePath);
  books = year
    ? books.filter((b) => b.finishedDate?.getUTCFullYear() === year)
    : books;

  if (books.length === 0) {
    console.log('No books found');
    exit(1);
  }

  const png = await generateCharts(books, year);
  writeFileSync('books.png', png);
} catch (e: unknown) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
}
