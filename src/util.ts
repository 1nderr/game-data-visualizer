export function countBy<T, K extends keyof T>(
  objects: T[],
  property: K,
  sort?: 'asc' | 'desc'
): Map<T[K], number> {
  const counts = new Map<T[K], number>();

  objects.forEach((object) => {
    const value = object[property];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return sort
    ? new Map(
        [...counts].sort((a, b) => (sort === 'asc' ? a[1] - b[1] : b[1] - a[1]))
      )
    : counts;
}
