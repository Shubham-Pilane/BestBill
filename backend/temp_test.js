require('dotenv').config();
const db = require('./src/db/db');

async function test() {
  try {
    const res = await db.query(`SELECT t.*, o.id as active_order_id 
       FROM tables t 
       LEFT JOIN orders o ON o.table_id = t.id AND o.status = 'active'
       ORDER BY t.floor ASC, CAST(NULLIF(t.table_number, '') AS INTEGER) ASC`);
    console.log("Success", res.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
