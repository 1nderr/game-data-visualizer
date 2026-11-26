import z from 'zod';

const SYSTEMS = [
  'pc',
  'nes',
  'snes',
  'n64',
  'gcn',
  'wii',
  'wii u',
  'ns1',
  'ns2',
  'gb',
  'gbc',
  'gba',
  'ds',
  '3ds',
  'ps1',
  'ps2',
  'ps3',
  'psp',
  'gen',
] as const;
const PURCHASE_METHODS = ['bought', 'neither', 'free'] as const;

export const Schema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().toLowerCase(),
  genre: z.string().toLowerCase(),
  system: z.string().toLowerCase().pipe(z.enum(SYSTEMS)),
  purchaseMethod: z.string().toLowerCase().pipe(z.enum(PURCHASE_METHODS)),
  completed: z.stringbool({ truthy: ['true'], falsy: ['false'] }),
  yearPlayed: z.coerce.number().int().min(1970).max(2200),
});

export type Game = z.infer<typeof Schema>;
