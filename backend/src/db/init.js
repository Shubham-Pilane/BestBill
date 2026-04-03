const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
};

const seedAdmin = async (pool) => {
  try {
    const adminEmail = 'admin@bestbill.com';
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

    if (existing.rows.length === 0) {
      console.log('Seeding Super Admin account...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Super Admin', adminEmail, hashedPassword, 'admin']
      );
      console.log('Super Admin created: admin@bestbill.com / admin123');
    }
  } catch (err) {
    console.error('Seed failed:', err);
  }
};

const initDB = async () => {
  const pool = new Pool(config);
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error('Schema file not found at:', schemaPath);
        return;
    }
    const sql = fs.readFileSync(schemaPath).toString();

    console.log('Synchronizing Schema...');
    await pool.query(sql);

    // Run migrations/alterations
    console.log('Running migrations...');
    const queries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'owner'",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS location TEXT",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS logo_url TEXT",
      "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255)"
    ];

    for (const q of queries) {
      try {
        await pool.query(q);
      } catch (e) {
        console.warn('Migration step skipped/failed:', q, e.message);
      }
    }

    await seedAdmin(pool);

    console.log('Database synchronization complete.');
  } catch (error) {
    console.error('Init failure:', error);
  } finally {
    await pool.end();
  }
};

initDB();
