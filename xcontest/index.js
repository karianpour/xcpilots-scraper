'use strict';
require('dotenv').config();

// const util = require('util');
// const fs = require('fs');
const reader = require('./flight-reader');
const {database} = require('./flight-saver');
const {scrapXContextForDaily, scrapXContextForCircle, scrapXContext} = require('./site-reader');


const WORLD_SCOPE = 'WRLD';

const circles = [
  {scope: 'IR1', lat: 37.982681,  lon: 46.608398, radius: 200000},
  {scope: 'IR2', lat: 34.988990,  lon: 47.399414, radius: 200000},
  {scope: 'IR3', lat: 32.189030,  lon: 49.113281, radius: 200000},
  {scope: 'IR4', lat: 36.257057,  lon: 50.431641, radius: 200000},
  {scope: 'IR5', lat: 33.737524,  lon: 51.442383, radius: 200000},
  {scope: 'IR6', lat: 30.386551,  lon: 52.321289, radius: 200000},
  {scope: 'IR7', lat: 35.937481,  lon: 54.562500, radius: 200000},
  {scope: 'IR8', lat: 36.363294,  lon: 57.682617, radius: 200000},
  {scope: 'IR9', lat: 32.374793,  lon: 55.199707, radius: 200000},
  {scope: 'IR10', lat: 28.355033,  lon: 55.183556, radius: 200000},
  {scope: 'IR11', lat: 29.718951,  lon: 57.358849, radius: 200000},
  {scope: 'IR12', lat: 33.063812,  lon: 58.424523, radius: 200000},
  {scope: 'IR13', lat: 28.052473,  lon: 52.579797, radius: 140000},
  {scope: 'IR14', lat: 32.934817,  lon: 46.691125, radius:  80000},
  {scope: 'IR15', lat: 37.633446,  lon: 55.809777, radius:  70000},
  {scope: 'IR16', lat: 30.200127,  lon: 49.906627, radius:  70000},
  {scope: 'IR17', lat: 26.843686,  lon: 58.838511, radius: 200000},
  {scope: 'IR18', lat: 29.166933,  lon: 51.34635, radius: 2000},
];
// const readFile = util.promisify(fs.readFile)

async function main(){
  await database.connect();
  // const html = await readFile('./samples/xcontest.txt', 'utf8');

  await scrapIran();
  await scrapDaily();

  console.log('finished');
}

async function scrapIran(){
  for(let i=0; i<circles.length; i++){
    for(let j=0; j<3; j++){
      try{
        await scrapForCircle(circles[i]);
        break;
      }catch(err){
        console.error(`faild with error ${err}`);
      }
    }
  }
}

async function scrapDaily(){
  const latestFlightDate = await database.latestFlight(WORLD_SCOPE);

  const now = new Date();
  let date = !!latestFlightDate ? latestFlightDate : now;

  date = new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000);

  while(date.getTime() < now.getTime()){
    for(let j=0; j < 3; j++){
      try{
        const toScrap = date.toISOString().substr(0, 10);

        const html = await scrapXContextForDaily(toScrap);

        const pageData = await reader.readPageDataDaily(WORLD_SCOPE, html);

        const promises = pageData.flights.map(async flight => {
          return database.saveFlight(flight);
        })

        await Promise.all(promises);

        date = new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000);
        break;
      }catch(err){
        console.error(`faild with error ${err}`);
      }
    }
  }
}

async function scrapForCircle(circle){

  const latestFlightDate = await database.latestFlight(circle.scope);

  console.log({latestFlightDate});

  let address;
  do{
    let html;
    if(!address){
      html = await scrapXContextForCircle(latestFlightDate, circle);
    }else{
      html = await scrapXContext(address);
    }

    const pageData = await reader.readPageData(circle.scope, html);

    const promises = pageData.flights.map(async flight => {
      return database.saveFlight(flight);
    })

    await Promise.all(promises);

    if(pageData.nextPageUrl===address){
      break;
    }
    address = pageData.nextPageUrl;
    if(!address){
      break;
    }
  }while(true);

}


main();
