const db = require('./backend/src/db/db');
db.query('SELECT NOW()').then(res => {
  console.log('DB SUCCESS:', res.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error('DB FAILED:', err.message);
  process.exit(1);
});
