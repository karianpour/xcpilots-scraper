'use strict';
require('dotenv').config();

// const util = require('util');
// const fs = require('fs');
const reader = require('./flight-reader');
const {database} = require('./flight-saver');
const {scrapXContextForDaily, scrapXContextForCircle, scrapXContext} = require('./site-reader');


const WORLD_SCOPE = 'WRLD';

async function main(){
  await database.connect();

  await scrapDaily();

  console.log('finished');
}

async function scrapDaily(){
  const latestFlightDate = await database.earliestFlight(WORLD_SCOPE);
  if(!latestFlightDate){
    console.log('no data to continue!');
    process.exit(0);
  }

  const firstDay = new Date('2007-11-18');
  let date = new Date(latestFlightDate.getTime() - 1 * 24 * 60 * 60 * 1000);

  while(date.getTime() > firstDay.getTime()){
    const toScrap = date.toISOString().substr(0, 10);

    const html = await scrapXContextForDaily(toScrap);

    const pageData = await reader.readPageDataDaily(WORLD_SCOPE, html);

    const promises = pageData.flights.map(async flight => {
      return database.saveFlight(flight);
    })

    await Promise.all(promises);

    sleepRandom(2, 5);

    date = new Date(date.getTime() - 1 * 24 * 60 * 60 * 1000);
  }
}

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleepRandom(n, m) {
  const k = pickRandom(n, m);
  msleep(k * 1000);
}

function pickRandom(n, m) {
  return Math.round((n + (m - n) * Math.random()) * 1000) / 1000;
}

main();