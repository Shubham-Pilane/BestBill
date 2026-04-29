const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_gT7nCsxbm0Nr@ep-crimson-star-ams19zdn-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function check() {
  try {
    const res = await pool.query("SELECT table_id, count(*) FROM orders WHERE status = 'active' AND table_id IS NOT NULL GROUP BY table_id HAVING count(*) > 1;");
    console.log('Duplicate Table Orders:', res.rows);
    
    const res2 = await pool.query("SELECT room_id, count(*) FROM orders WHERE status = 'active' AND room_id IS NOT NULL GROUP BY room_id HAVING count(*) > 1;");
    console.log('Duplicate Room Orders:', res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
