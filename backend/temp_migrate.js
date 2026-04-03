const db = require('./src/db/db');
async function run() {
  try {
    const q = `CREATE TABLE IF NOT EXISTS subscription_history (
      id SERIAL PRIMARY KEY,
      hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      months_added INTEGER NOT NULL,
      valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      valid_until TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await db.query(q);
    console.log('History table created');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit();
  }
}
run();
