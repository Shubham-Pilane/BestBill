const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function resetAdmin() {
  try {
    const adminEmail = 'admin@bestbill.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const res = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
      [hashedPassword, adminEmail]
    );

    if (res.rowCount > 0) {
      console.log('Super Admin password successfully reset to "admin123"');
    } else {
      console.log('Super Admin user not found. Creating it...');
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Super Admin', adminEmail, hashedPassword, 'admin']
      );
      console.log('Super Admin created with password "admin123"');
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

resetAdmin();
