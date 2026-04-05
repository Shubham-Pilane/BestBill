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

// Get a single bill with items
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await db.query(`
      SELECT b.*, t.table_number, o.created_at as order_time,
             h.name as hotel_name, h.phone as hotel_phone, h.location as hotel_location, h.gst_percentage
      FROM bills b 
      JOIN orders o ON b.order_id = o.id 
      JOIN tables t ON o.table_id = t.id 
      JOIN hotels h ON t.hotel_id = h.id
      WHERE b.id = $1 AND t.hotel_id = $2`, 
      [id, req.user.hotel_id]
    );
    
    if (bill.rows.length === 0) return res.status(404).json({ message: 'Bill not found' });
    
    const items = await db.query(`
      SELECT oi.quantity, mi.name, mi.price 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = $1`,
      [bill.rows[0].order_id]
    );
    
    res.json({
      ...bill.rows[0],
      items: items.rows,
      subtotal: items.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving bill details' });
  }
});

module.exports = router;
