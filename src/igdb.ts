import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { Game } from './schema.js';

const AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_URL = 'https://api.igdb.com/v4/games';
const IGDB_IMAGE_URL =
  'https://images.igdb.com/igdb/image/upload/t_cover_big_2x';
const COVER_CACHE = 'cover_cache';

interface IgdbAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: 'bearer';
}

interface IgdbGame {
  id: number;
  cover?: { image_id: string };
}

async function authenticate(): Promise<IgdbAuthResponse> {
  const response = await fetch(
    `${AUTH_URL}?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  if (response.ok) {
    return (await response.json()) as IgdbAuthResponse;
  } else {
    throw new Error(`Error authenticating to Twitch: ${response.status}`);
  }
}

async function getGames(games: Game[], token: string): Promise<IgdbGame[]> {
  const response = await fetch(IGDB_URL, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID,
      authorization: `Bearer ${token}`,
    },
    body: `fields cover.image_id; where id = (${games.map((g) => g.id).join(',')}); limit 500;`,
  });

  if (response.ok) {
    return (await response.json()) as IgdbGame[];
  } else {
    throw new Error(
      `IGDB request failed: ${response.status} ${await response.text()}`
    );
  }
}

async function downloadCover(imageId: string): Promise<Buffer> {
  const res = await fetch(`${IGDB_IMAGE_URL}/${imageId}.jpg`);
  if (!res.ok) throw Error(`Cover download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function coverPath(id: number): string {
  return `./${COVER_CACHE}/${id}.jpg`;
}

export async function downloadCovers(games: Game[]): Promise<string[]> {
  mkdirSync(`./${COVER_CACHE}`, { recursive: true });

  const gamesWithoutCovers = games.filter((g) => !existsSync(coverPath(g.id)));

  let igdbGames: IgdbGame[] = [];
  if (gamesWithoutCovers.length > 0) {
    const { access_token: accessToken } = await authenticate();
    igdbGames = await getGames(gamesWithoutCovers, accessToken);
  }

  for (const game of gamesWithoutCovers) {
    const igdbGame = igdbGames.find((i) => i.id === game.id);
    if (!igdbGame?.cover) {
      console.warn(`[warn] cover not found for "${game.title}"`);
      continue;
    }

    try {
      const cover = await downloadCover(igdbGame.cover.image_id);
      writeFileSync(coverPath(game.id), cover);
    } catch {
      console.warn(`[warn] failed to download cover for "${game.title}"`);
    }
  }

  return games.map((g) => coverPath(g.id)).filter(existsSync);
}
