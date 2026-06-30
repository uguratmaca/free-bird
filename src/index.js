const { parseArgs } = require('node:util');
const googleTrends = require('google-trends-api');
const correlation = require('./correlation');

const { values, positionals } = parseArgs({
  options: {
    from: { type: 'string', default: '2018-09-18' },
    to: { type: 'string' },
    geo: { type: 'string', default: 'TR' },
    category: { type: 'string' },
  },
  allowPositionals: true,
});

function isCoarsePeriod(period) {
  return /^\d{4}$/.test(period) || /^\d{4}-\d{2}$/.test(period);
}

function startOfPeriod(period) {
  if (/^\d{4}$/.test(period)) return new Date(`${period}-01-01T00:00:00`);
  if (/^\d{4}-\d{2}$/.test(period)) return new Date(`${period}-01T00:00:00`);
  return new Date(`${period}T00:00:00`);
}

function endOfPeriod(period) {
  if (/^\d{4}$/.test(period)) return new Date(`${period}-12-31T23:59:59`);
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-').map(Number);
    return new Date(year, month, 0, 23, 59, 59);
  }
  return new Date(`${period}T23:59:59`);
}

function resolveTimeRange() {
  const startTime = startOfPeriod(values.from);
  let endTime;
  if (values.to) {
    endTime = endOfPeriod(values.to);
  } else if (isCoarsePeriod(values.from)) {
    endTime = endOfPeriod(values.from);
  }
  if (endTime && endTime > new Date()) {
    endTime = new Date();
  }
  return { startTime, endTime };
}

function describeCorrelation(keyword1, keyword2, rank, determination) {
  const strength = Math.abs(rank);
  let label;
  if (strength >= 0.8) label = 'very strong';
  else if (strength >= 0.6) label = 'strong';
  else if (strength >= 0.4) label = 'moderate';
  else if (strength >= 0.2) label = 'weak';
  else label = 'negligible';

  const direction = rank >= 0 ? 'move together' : 'move in opposite directions';
  const sharedPattern = Math.round(determination * 100);

  return `${label.charAt(0).toUpperCase()}${label.slice(1)} relationship — ${keyword1} and ${keyword2} tend to ${direction}. About ${sharedPattern}% of one's search-interest swings line up with the other's.`;
}

async function correlateForGeo(keyword1, keyword2, geo, startTime, endTime, category) {
  const results = await googleTrends.interestOverTime({
    keyword: [keyword1, keyword2],
    startTime,
    ...(endTime && { endTime }),
    geo,
    ...(category && { category }),
  });

  const timelineData = JSON.parse(results).default.timelineData;
  const item1 = timelineData.map((item) => item.value[0]);
  const item2 = timelineData.map((item) => item.value[1]);

  return {
    rank: correlation.rank(item1, item2),
    determination: correlation.determination(item1, item2),
  };
}

async function runCorrelate() {
  const [keyword1 = 'beşiktaş', keyword2 = 'fenerbahçe'] = positionals;
  const { startTime, endTime } = resolveTimeRange();
  const category = values.category ? Number(values.category) : undefined;
  const geos = values.geo.split(',').map((g) => g.trim()).filter(Boolean);

  if (geos.length === 1) {
    const { rank, determination } = await correlateForGeo(keyword1, keyword2, geos[0], startTime, endTime, category);
    console.log(`${keyword1} vs ${keyword2} (${geos[0]})`);
    console.log(`rank: ${rank.toFixed(2)}, determination: ${determination.toFixed(2)}`);
    console.log(describeCorrelation(keyword1, keyword2, rank, determination));
    return;
  }

  console.log(`${keyword1} vs ${keyword2}`);
  for (const geo of geos) {
    const { rank, determination } = await correlateForGeo(keyword1, keyword2, geo, startTime, endTime, category);
    console.log(`\n[${geo}] rank: ${rank.toFixed(2)}, determination: ${determination.toFixed(2)}`);
    console.log(describeCorrelation(keyword1, keyword2, rank, determination));
  }
}

async function runRelated() {
  const [, keyword] = positionals;
  if (!keyword) {
    console.error('Usage: node src/index.js related <keyword> [--geo GEO]');
    process.exitCode = 1;
    return;
  }

  const geo = values.geo.split(',')[0].trim();
  const results = await googleTrends.relatedQueries({ keyword, geo });
  const rankedList = JSON.parse(results).default.rankedList;

  const printList = (title, list) => {
    console.log(`\n${title}`);
    if (!list || list.length === 0) {
      console.log('  (no data)');
      return;
    }
    for (const { query, formattedValue } of list.slice(0, 10)) {
      console.log(`  ${query} (${formattedValue})`);
    }
  };

  console.log(`Related queries for "${keyword}" (${geo})`);
  printList('Top', rankedList[0] && rankedList[0].rankedKeyword);
  printList('Rising', rankedList[1] && rankedList[1].rankedKeyword);
  console.log('\nPick one of these as your second keyword to correlate against:');
  console.log(`  node src/index.js "${keyword}" "<related term>" --geo ${geo}`);
}

async function main() {
  if (positionals[0] === 'related') {
    await runRelated();
  } else {
    await runCorrelate();
  }
}

main().catch((err) => {
  console.error('Oh no there was an error', err);
});
