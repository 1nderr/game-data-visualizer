# Game Data Visualizer

A small CLI that turns a CSV of the games I've played into an image. For a given year it shows the game covers from [IGDB](https://www.igdb.com/) next to charts of genres and systems. Without a year it shows all-time charts.

![Screenshot of the 2023 output showing a grid of game covers next to genre and system bar charts](docs/screenshot.png)

## Setup

```sh
npm install
```

Add IGDB credentials to a `.env` file:

```sh
IGDB_CLIENT_ID=...
IGDB_CLIENT_SECRET=...
```

## Usage

```sh
npm start -- games.csv --year 2023
```

The image is written to `out.png`.
