const db = require('./src/db/db');

async function test() {
  const id = 1; // Test hotel id
  try {
     const res = await db.query(`
        SELECT b.*, o.created_at as order_time, t.table_number 
        FROM bills b 
        JOIN orders o ON b.order_id = o.id 
        JOIN tables t ON o.table_id = t.id 
        WHERE t.hotel_id = $1 
        ORDER BY b.created_at DESC`, [id]);
     console.log('Query success:', res.rows.length);
  } catch (err) {
     console.error('QUERY FAILED:', err.message);
  } finally {
     process.exit();
  }
}

test();
