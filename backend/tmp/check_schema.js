const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('Columns in "users" table:');
    console.table(res.rows);
    
    const hotels = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    console.log('Columns in "hotels" table:');
    console.table(hotels.rows);

    const superAdmin = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@bestbill.com']);
    console.log('Super Admin user data:');
    console.log(superAdmin.rows);

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();
