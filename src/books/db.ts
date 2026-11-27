import sqlite3 from 'sqlite3';
import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';

const QUERY = `
    SELECT book.id,
           book.title,
           tag.name AS tag,
           pages.value AS pages,
           finished.value AS finished,
           status.value AS status,
           book.path,
           book.has_cover
    FROM books AS book
    LEFT JOIN books_tags_link AS book_tag ON book_tag.book = book.id
    LEFT JOIN tags AS tag ON tag.id = book_tag.tag
    LEFT JOIN custom_column_1 AS pages ON pages.book = book.id
    LEFT JOIN custom_column_3 AS finished ON finished.book = book.id
    LEFT JOIN books_custom_column_6_link AS status_link ON status_link.book = book.id
    LEFT JOIN custom_column_6 AS status ON status.id = status_link.value
`;

type Status = 'backlog' | 'dnf' | 'finished' | 'in-progress';

interface BookRow {
  id: number;
  title: string;
  tag: string | null;
  pages: number | null;
  finished: string | null;
  status: string | null;
  path: string;
  has_cover: 0 | 1;
}

export interface Book {
  id: number;
  title: string;
  tags: string[];
  pages: number | null;
  finishedDate: Date | null;
  status: Status;
  coverPath: string | null;
}

function toBook(row: BookRow, library: string): Book {
  return {
    id: row.id,
    title: row.title.toLowerCase(),
    tags: row.tag ? [row.tag] : [],
    pages: row.pages,
    finishedDate: row.finished ? new Date(row.finished) : null,
    coverPath: row.has_cover ? join(library, row.path, 'cover.jpg') : null,
    status: (row.status?.toLowerCase() as Status) ?? 'backlog',
  };
}

export async function getBooks(filePath: string): Promise<Book[]> {
  if (!existsSync(filePath)) {
    throw Error(`File does not exist: ${filePath}`);
  }

  if (!statSync(filePath).isFile()) {
    throw Error(`Not a file: ${filePath}`);
  }

  let rows: BookRow[];
  const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY);
  try {
    rows = await new Promise<BookRow[]>((resolve, reject) => {
      db.all<BookRow>(QUERY, (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });
  } finally {
    db.close();
  }

  const library = dirname(filePath);
  return Object.values(
    rows
      .map((row) => toBook(row, library))
      .filter((book) => book.status === 'finished' || book.status === 'dnf')
      .reduce<Record<number, Book>>((acc, book) => {
        if (!acc[book.id]) {
          acc[book.id] = { ...book, tags: [] };
        }
        acc[book.id].tags.push(...book.tags);
        return acc;
      }, {})
  );
}
