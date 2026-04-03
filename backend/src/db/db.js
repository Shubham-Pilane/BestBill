const { Pool } = require('pg');

// Build connection config - supports both local TCP and Cloud SQL Unix sockets
const dbConfig = {
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
};

// Cloud SQL uses Unix socket paths like /cloudsql/project:region:instance
if (process.env.DB_HOST && process.env.DB_HOST.startsWith('/cloudsql/')) {
  dbConfig.host = process.env.DB_HOST;
  // No port needed for Unix socket connections
  console.log(`[DB] Connecting via Cloud SQL socket: ${process.env.DB_HOST}`);
} else {
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = process.env.DB_PORT || 5432;
  console.log(`[DB] Connecting via TCP: ${dbConfig.host}:${dbConfig.port}`);
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
