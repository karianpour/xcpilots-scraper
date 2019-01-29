'use strict';

const cheerio = require('cheerio');


async function readPageData(scope, html){
  const loaded = cheerio.load(html);

  // console.log(loaded);
  const flightTable = loaded('table.flights');

  const flights = [];

  let flightRow = flightTable.children('tbody').children('tr').first();
  while(flightRow.length > 0){
    const flight = readFlight(flightRow);
    flight.scope = scope;
    flights.push(flight);
    flightRow = flightRow.next();
  }

  const nextPageUrl = loaded('div.paging').contents().last().prev().prev().attr('href');

  return {
    flights,
    nextPageUrl,
  };
}

function readFlight(flightRow){
  const flight_id = flightRow.attr('id');
  // console.log(flight_id)
  const flight_date = convertToIsoDate(flightRow.children('td').eq(1).contents().first().get(0).nodeValue) +'T'+flightRow.children('td').eq(1).contents().last().contents().first().get(0).nodeValue;
  const utcOffset = (new Date(flight_date)).getTimezoneOffset();
  // console.log(flight_date);
  const pilot_country = flightRow.find('td div.full span.cic').contents().first().get(0).nodeValue.trim();
  const pilot_name = flightRow.find('td div.full a.plt').contents().first().get(0).nodeValue.trim();
  const site_country = flightRow.find('td div.full span.cic').contents().eq(1).get(0).nodeValue.trim();
  const site_name = flightRow.find('td div.full a.lau').contents().first().get(0) ? flightRow.find('td div.full a.lau').contents().first().get(0).nodeValue.trim() : '';
  const flight_type = flightRow.children().eq(4).children().attr('title').trim();
  const flight_length = flightRow.find('td.km strong').contents().first().get(0).nodeValue.trim();
  const flight_length_unit = flightRow.find('td.km strong').parent().contents().get(1).nodeValue.trim();
  const flight_points = flightRow.find('td.pts strong').contents().first().get(0).nodeValue.trim();
  const flight_url = flightRow.find('td div a.detail').attr('href').trim();
  const glider = flightRow.children('td').eq(7).contents().first().attr('title').trim();
  const glider_class = flightRow.children('td').eq(7).contents().first().contents().first().contents().get(0).nodeValue.trim();

  
  return {
    flight_id,
    flight_date,
    utcOffset,
    pilot_country,
    pilot_name,
    site_country,
    site_name,
    flight_type,
    flight_length,
    flight_length_unit,
    flight_points,
    flight_url,
    glider,
    glider_class,
  }
}

function readPageDataDaily(scope, json){
  const flights = json.items.map(item => {
    const flight = readFlightDaily(item);
    flight.scope = scope;
    return flight;
  });

  return {
    flights,
  };
}

function readFlightDaily(item){
  const flight_id = 'fligh-'+item.id;
  const flight_date = new Date(item.pointStart.time);
  const utcOffset = item.utcOffsetStart / 60;
  const pilot_country = item.pilot.countryIso;
  const pilot_name = item.pilot.name;
  const site_country = item.takeoff.countryIso;
  const site_name = item.takeoff.name;
  const flight_type = item.league.route.type;
  const flight_length = item.league.route.distance;
  const flight_length_unit = 'km';
  const flight_points = item.league.route.points;
  const flight_url = item.league.flight.link;
  const glider = item.glider.name;
  const glider_class = item.glider.class;

  
  return {
    flight_id,
    flight_date,
    utcOffset,
    pilot_country,
    pilot_name,
    site_country,
    site_name,
    flight_type,
    flight_length,
    flight_length_unit,
    flight_points,
    flight_url,
    glider,
    glider_class,
  }
}

function convertToIsoDate(date){
  return `20${date.substring(6, 8)}-${date.substring(3, 5)}-${date.substring(0, 2)}`;
}

// function convertOffetSecondToHour(seconds) {
//   if(seconds===0) return 'Z';
//   const h = Math.floor(Math.abs(seconds) / 3600);
//   const m = Math.floor(Math.abs(seconds) % 3600 / 60);

//   let hDisplay = h > 0 ? h.toString() : '';
//   hDisplay = '00'.substr(0, 2 - hDisplay.length) + hDisplay;
//   let mDisplay = m > 0 ? m.toString() : '';
//   mDisplay = '00'.substr(0, 2 - mDisplay.length) + mDisplay;
//   const sign = seconds > 0 ? '+' : '-';

//   return sign + hDisplay + ':' + mDisplay; 
// }

module.exports = {
  readPageData,
  readPageDataDaily,
}