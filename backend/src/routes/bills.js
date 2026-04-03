const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get billing history for a hotel
router.get('/history', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, t.table_number, o.created_at as order_time 
      FROM bills b 
      JOIN orders o ON b.order_id = o.id 
      JOIN tables t ON o.table_id = t.id 
      WHERE t.hotel_id = $1 
      ORDER BY b.created_at DESC`, 
      [req.user.hotel_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving billing history' });
  }
});

module.exports = router;
