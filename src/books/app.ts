import { exit } from 'process';
import { parseArgs } from '../shared/args.js';
import { getBooks } from './db.js';

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
} catch (e: unknown) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
}
