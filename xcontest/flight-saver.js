'use strict';
const massive = require('massive');
const uuidv1 = require('uuid/v1');

const database = {
  connect: async () => {
    this.db = await massive({
      host: '127.0.0.1',
      port: 5432,
      database: 'xcpilots',
      user: 'postgres',
      password: 'hstnkayvan'
    });
  },

  saveFlight: async (flight) => {
    flight.id = uuidv1();
    flight.created_at = new Date();
    // console.log(flight.flight_id)
    // const inserted = await this.db.flights.insert(flight);
    const result = await this.db.query(
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
    return result;
  },

  latestFlight: async (scope) => {
    const result = await this.db.query(`select max(flight_date) as latest_flight from flights where scope = '${scope}'`);
    return result[0]['latest_flight'];
  },
}


module.exports = {
  database
}
