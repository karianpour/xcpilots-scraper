'use strict';

const rp = require('request-promise-native');
const encodeUrl = require('encodeurl');

// const radius = 200000;
// const lon = '52.6464';
// const lat = '32.87958';

async function scrapXContextForCircle(lastFlightDateInDb, circle){
  const from = !!lastFlightDateInDb ? lastWeek(lastFlightDateInDb) : '2007-11-18';
  const till = yesterday(); //'2019-01-27';

  const {lat, lon, radius} = circle;

  const address = `https://www.xcontest.org/world/en/flights-search/?list[sort]=time_start&list[dir]=up&filter[point]=${lon}%20${lat}&filter[radius]=${radius}&filter[mode]=START&filter[date_mode]=period&filter[date]=${from}&filter[date_to]=${till}&filter[value_mode]=dst&filter[min_value_dst]=5&filter[catg]=FAI3&filter[route_types]=&filter[avg]=&filter[pilot]=`;
  console.log(address);

  const html = await rp.get(address);
  
  return html;
}

async function scrapXContextForDaily(date){
  // 2019-01-29
  let season;
  if(date.substr(5, 2) < '10'){
    season = date.substr(0, 4);
  }else{
    season = (parseInt(date.substr(0, 4))+1).toString();
  }
  const address = `https://www.xcontest.org/api/data/?flights/world/${season}&lng=en&key=03ECF5952EB046AC-A53195E89B7996E4-D1B128E82C3E2A66&google_maps_api_key=null&callback=window.top.ZenController._callJSONP&params[]=487804540e1ae5849fb43a1a3ea546be&list[start]=0&list[num]=10&list[sort]=points&list[dir]=down&filter[date]=${date}&filter[fai_classes]=3`;
  console.log(address);

  const options = {
    method: 'GET',
    uri: address,
    headers: {
      'accept': '*/*',
      'accept-Encoding': 'gzip, deflate, br',
      'accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,fa;q=0.6,fr;q=0.5',
      'connection': 'keep-alive',
      'cookie': '_ga=GA1.2.899861980.1548612648; _gid=GA1.2.1379062577.1548612648; AStat=N; PHPSESSID=ef2676f73647313264a6b50b09996a5c; _gat=1',
      'host': 'www.xcontest.org',
      'if-none-match': 'b9ef5f56c7af9398262617c00c33d2c0cce15e8a',
      'referer': 'https://www.xcontest.org/blank.html',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    },
    gzip: true,
  };

  const html = await rp(options);

  const json = JSON.parse(html.substring(36, html.length - 37));
  
  return json;
}

async function scrapXContext(address){
  console.log(address);
  const html = await rp.get(encodeUrl(address));
  return html;
}

function yesterday(){
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().substr(0, 10);
}

function lastWeek(date){
  date.setDate(date.getDate() - 7);
  return date.toISOString().substr(0, 10);
}

module.exports = {
  scrapXContextForCircle,
  scrapXContext,
  scrapXContextForDaily,
}
