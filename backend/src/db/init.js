// const { Pool, Client } = require('pg');
// const fs = require('fs');
// const path = require('path');
// const bcrypt = require('bcrypt');
// require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// const config = {
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// };

// const createDatabase = async () => {
//   const client = new Client({ ...config, database: 'postgres' });
//   try {
//     await client.connect();
//     const res = await client.query(`SELECT 1 FROM pg_database WHERE datname=$1`, [process.env.DB_NAME]);
//     if (res.rowCount === 0) {
//       console.log(`Creating database ${process.env.DB_NAME}...`);
//       await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
//     }
//   } catch (error) {
//     console.error('Error creating database:', error);
//   } finally {
//     await client.end();
//   }
// };

// const seedAdmin = async (pool) => {
//   try {
//     const adminEmail = 'admin@bestbill.com';
//     const existing = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

//     if (existing.rows.length === 0) {
//       console.log('Seeding Super Admin account...');
//       const hashedPassword = await bcrypt.hash('admin123', 10);
//       await pool.query(
//         'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
//         ['Super Admin', adminEmail, hashedPassword, 'admin']
//       );
//       console.log('Super Admin created: admin@bestbill.com / admin123');
//     }
//   } catch (err) {
//     console.error('Seed failed:', err);
//   }
// };

// const initDB = async () => {
//   await createDatabase();

//   const pool = new Pool({ ...config, database: process.env.DB_NAME });
//   try {
//     const schemaPath = path.join(__dirname, 'schema.sql');
//     const sql = fs.readFileSync(schemaPath).toString();

//     console.log('Synchronizing Schema...');
//     await pool.query(sql);

//     // Migration: Add role column if missing (for existing systems)
//     try {
//       await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'owner'");
//       await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
//       await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS location TEXT");
//       await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS logo_url TEXT");
//       await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255)");
//     } catch (e) {}

//     await seedAdmin(pool);

//     console.log('Database synchronization complete.');
//   } catch (error) {
//     console.error('Init failure:', error);
//   } finally {
//     await pool.end();
//   }
// };

// initDB();


const initDB = async () => {
  // ❌ removed createDatabase()

  const pool = new Pool({ ...config, database: process.env.DB_NAME });
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath).toString();

    console.log('Synchronizing Schema...');
    await pool.query(sql);

    // migrations
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'owner'");
    await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
    await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS location TEXT");
    await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS logo_url TEXT");
    await pool.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255)");

    await seedAdmin(pool);

    console.log('Database synchronization complete.');
  } catch (error) {
    console.error('Init failure:', error);
  } finally {
    await pool.end();
  }
};
