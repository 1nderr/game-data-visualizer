# Media Wrapped

Turns logs of the media I've consumed into a yearly recap image: the covers next to a few charts.

## Setup

```sh
npm install
```

## Games

![Screenshot of the 2023 games recap showing a grid of game covers next to genre and system bar charts](docs/screenshot.png)

Covers come from [IGDB](https://www.igdb.com/). Add IGDB credentials to a `.env` file:

```sh
IGDB_CLIENT_ID=...
IGDB_CLIENT_SECRET=...
```

The CSV needs these columns, where `id` is the game's IGDB id:

```csv
id,title,genre,system,purchaseMethod,completed,yearPlayed
27238,am2r: return of samus,metroidvania,pc,free,true,2019
```

```sh
npm run games -- path/to/games.csv --year 2023
```

The image is written to `out.png`.
