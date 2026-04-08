const { Pool } = require('pg');

let dbConfig = {};

if (process.env.DATABASE_URL) {
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
  };
  console.log(`[DB] Connecting via DATABASE_URL (Neon/Cloud)`);
} else {
  // Build fallback connection config - supports both local TCP and Cloud SQL Unix sockets
  dbConfig = {
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  };

  if (process.env.DB_HOST && process.env.DB_HOST.startsWith('/cloudsql/')) {
    dbConfig.host = process.env.DB_HOST;
    console.log(`[DB] Connecting via Cloud SQL socket: ${process.env.DB_HOST}`);
  } else {
    dbConfig.host = process.env.DB_HOST || 'localhost';
    dbConfig.port = process.env.DB_PORT || 5432;
    console.log(`[DB] Connecting via TCP: ${dbConfig.host}:${dbConfig.port}`);
  }
}

const pool = new Pool(dbConfig);

pool.on('error', (err, client) => {
  console.error('DATABASE BACKGROUND ERROR:', err.message);
  // process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
