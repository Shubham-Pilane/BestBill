const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkAllUsers() {
  try {
    const users = await pool.query('SELECT * FROM users');
    console.log('--- ALL USERS ---');
    console.table(users.rows);
    
    const hotels = await pool.query('SELECT * FROM hotels');
    console.log('--- ALL HOTELS ---');
    console.table(hotels.rows);

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkAllUsers();
