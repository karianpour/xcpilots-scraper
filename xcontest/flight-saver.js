'use strict';
const massive = require('massive');
const uuidv1 = require('uuid/v1');

const database = {
  connect: async () => {
    this.db = await massive({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  },

  saveFlight: async (flight) => {
    flight.id = uuidv1();
    flight.created_at = new Date();

    const resultSelect = await this.db.query(
      `select id from flights where pilot_name = $1 and flight_date::date = $2::date`,
      [
        flight.pilot_name,
        flight.flight_date,
      ]
    );
    if(resultSelect.length > 0){
      flight.id = resultSelect[0].id;

      await this.db.query(
        `
          update flights set (scope, flight_id, flight_date, utcOffset, pilot_country, pilot_name, site_country, site_name, flight_type, flight_length, flight_length_unit, flight_points, flight_url, glider, glider_class, created_at)
          = ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          where id = $1
        `,
        [
          flight.id,
          flight.scope,
          flight.flight_id,
          flight.flight_date,
          flight.utcOffset,
          flight.pilot_country,
          flight.pilot_name,
          flight.site_country,
          flight.site_name,
          flight.flight_type,
          flight.flight_length,
          flight.flight_length_unit,
          flight.flight_points,
          flight.flight_url,
          flight.glider,
          flight.glider_class,
          flight.created_at
        ]
      );
    }else{

      // console.log(flight.flight_id)
      // const inserted = await this.db.flights.insert(flight);
      await this.db.query(
        `insert into flights (id, scope, flight_id, flight_date, utcOffset, pilot_country, pilot_name, site_country, site_name, flight_type, flight_length, flight_length_unit, flight_points, flight_url, glider, glider_class, created_at)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          on conflict (flight_id) do nothing returning flight_id
        `,
        [
          flight.id,
          flight.scope,
          flight.flight_id,
          flight.flight_date,
          flight.utcOffset,
          flight.pilot_country,
          flight.pilot_name,
          flight.site_country,
          flight.site_name,
          flight.flight_type,
          flight.flight_length,
          flight.flight_length_unit,
          flight.flight_points,
          flight.flight_url,
          flight.glider,
          flight.glider_class,
          flight.created_at
        ]
      );
    }
  },

  earliestFlight: async (scope) => {
    const result = await this.db.query(`select min(flight_date) as earliest_flight from flights where scope = '${scope}'`);
    return result[0]['earliest_flight'];
  },

  latestFlight: async (scope) => {
    const result = await this.db.query(`select max(flight_date) as latest_flight from flights where scope = '${scope}'`);
    return result[0]['latest_flight'];
  },

  eraseDuplicatFlights: async () => {
    const result = await this.db.query(`
    with d as (
      select pilot_name, flight_date::date, count(*) as qty
      from flights
      group by 1, 2
      having count(*) > 1
    ), b as (
      select f.id, f.pilot_name, f.flight_date::date, created_at, row_number() over (partition by f.pilot_name, f.flight_date::date order by f.created_at desc, flight_id desc) as rowno
      from flights f
      inner join d on f.pilot_name = d.pilot_name and f.flight_date::date = d.flight_date::date
    )
    delete from flights where id in (select id from b where rowno != 1);
    `);
    return result[0]['latest_flight'];
  }
}


module.exports = {
  database
}
