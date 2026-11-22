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

export const Schema = z.object({
  title: z.string().toLowerCase(),
  genre: z.string().toLowerCase(),
  system: z.string().toLowerCase().pipe(z.enum(SYSTEMS)),
  purchaseMethod: z.string().toLowerCase().pipe(z.enum(PURCHASE_METHODS)),
  completed: z.stringbool({ truthy: ['true'], falsy: ['false'] }),
  yearPlayed: z.coerce.number().int().min(1970).max(2200),
});

export type Game = z.infer<typeof Schema>;
