export type Status = 'backlog' | 'dnf' | 'finished' | 'in-progress';

export interface Book {
  id: number;
  title: string;
  tags: string[];
  pages: number | null;
  finishedDate: Date | null;
  status: Status;
  coverPath: string | null;
}
