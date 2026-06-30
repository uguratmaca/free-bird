# free-bird
correlation on google trends

Compares how two search terms trend together on Google Trends, using Pearson correlation.

## Usage

```sh
npm install
node src/index.js [keyword1] [keyword2] [--from PERIOD] [--to PERIOD] [--geo GEO] [--category ID]
```

`PERIOD` accepts a year (`2023`), a month (`2023-06`), or an exact day (`2023-06-15`).
If `--to` is omitted, a year/month `--from` expands to cover that whole period; a day-level
`--from` runs through to today.

Defaults to `beşiktaş` vs `fenerbahçe`, since `2018-09-18`, through today, in `TR`.

```sh
node src/index.js bitcoin ethereum --from 2023 --geo US
node src/index.js bitcoin ethereum --from 2023-06 --to 2023-12 --geo US
```

### Category filter

Narrow results to a specific topic to avoid noise from ambiguous keywords (e.g. "jaguar" the
car vs. the animal). Pass a numeric category ID — common ones: `0` All, `20` Sports, `3` Arts &
Entertainment, `16` News, `7` Finance, `45` Health, `174` Science. Full list:
[Google Trends category IDs](https://github.com/pat310/google-trends-api/wiki/Google-Trends-Categories).

```sh
node src/index.js jaguar lion --geo US --category 20
```

### Compare across multiple regions

Pass a comma-separated list to `--geo` to see whether a relationship holds across regions or is
locale-specific.

```sh
node src/index.js bitcoin ethereum --from 2023 --geo US,TR,GB
```

### Discover a keyword to correlate against

Not sure what to compare a keyword to? `related` lists what people who search it also search for.

```sh
node src/index.js related bitcoin --geo US
```
