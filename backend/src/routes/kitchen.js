const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const { notifyUpdate } = require('../socket');
const router = express.Router();

// Get active kitchen orders (Strictly Dine-in Table orders sent by waiter)
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT 
         o.id as order_id,
         o.table_id,
         o.created_at,
         o.status,
         o.guest_note,
         o.source,
         o.waiter_name,
         o.kot_sent_at,
         t.table_number,
         t.floor as table_floor,
         COALESCE(
           (SELECT SUM(oi.quantity * mi.price)
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = o.id), 0.00
         ) as total_amount,
         COALESCE(
           (SELECT json_agg(
             json_build_object(
               'id', oi.id,
               'name', mi.name,
               'quantity', oi.quantity
             )
           )
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = o.id), '[]'::json
         ) as items
       FROM orders o
       JOIN tables t ON o.table_id = t.id
       WHERE t.hotel_id = $1
         AND o.status = 'active'
         AND o.kot_sent_at IS NOT NULL
         AND COALESCE(o.is_prepared, false) = false
       ORDER BY o.kot_sent_at DESC`,
      [req.user.hotel_id]
    );

    // Filter out orders that have no items
    const activeOrders = orders.rows.filter(o => o.items && o.items.length > 0);
    res.json(activeOrders);
  } catch (err) {
    console.error('Error fetching kitchen orders:', err);
    res.status(500).json({ message: 'Error fetching kitchen orders' });
  }
});

// Mark order as prepared
router.put('/orders/:orderId/prepare', auth, async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await db.query(
      `UPDATE orders 
       SET is_prepared = true 
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM orders o
         JOIN tables t ON o.table_id = t.id
         WHERE o.id = $1 AND t.hotel_id = $2
       ) RETURNING *`,
      [orderId, req.user.hotel_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    notifyUpdate(req.user.hotel_id, 'table-update');
    notifyUpdate(req.user.hotel_id, 'kitchen-update');

    res.json({ success: true, message: 'Order marked as prepared' });
  } catch (err) {
    console.error('Error preparing order:', err);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

module.exports = router;
