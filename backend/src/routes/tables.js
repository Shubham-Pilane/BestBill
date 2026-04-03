const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();
const { sendSMS } = require('../services/smsService');

// Get all tables for a hotel
router.get('/', auth, async (req, res) => {
  try {
    const tables = await db.query(
      `SELECT t.*, 
       (SELECT id FROM orders WHERE table_id = t.id AND status = 'active' LIMIT 1) as active_order_id 
       FROM tables t 
       WHERE t.hotel_id = $1 
       ORDER BY CAST(NULLIF(t.table_number, '') AS INTEGER) ASC`,
      [req.user.hotel_id]
    );
    res.json(tables.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching tables' });
  }
});

// Create tables (Batch create)
router.post('/batch', auth, async (req, res) => {
  const { tableNumbers } = req.body;
  if (!tableNumbers || tableNumbers.length === 0) return res.status(400).json({ message: 'No tables provided' });
  
  try {
    const values = tableNumbers.map((num, i) => `($1, '${num}')`).join(',');
    // Note: Parameterized multi-insert is safer but complex for unknown lengths. 
    // Since tableNumbers are strings from prompt, we trust basic sanitation or use specific $ placeholders.
    // For simplicity here, we'll do them one by one or trust the prompt input.
    for (const num of tableNumbers) {
       await db.query('INSERT INTO tables (hotel_id, table_number) VALUES ($1, $2)', [req.user.hotel_id, num]);
    }
    res.status(201).json({ message: 'Tables created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating tables' });
  }
});

// Get order for a table
router.get('/:tableId/order', auth, async (req, res) => {
  const { tableId } = req.params;
  try {
    let order = await db.query('SELECT * FROM orders WHERE table_id = $1 AND status = $2', [tableId, 'active']);
    
    if (order.rows.length === 0) {
      order = await db.query('INSERT INTO orders (table_id, status) VALUES ($1, $2) RETURNING *', [tableId, 'active']);
    }

    const orderId = order.rows[0].id;
    const items = await db.query(
      'SELECT oi.*, mi.name, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
      [orderId]
    );

    res.json({ order: order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Add item to order
router.post('/:tableId/order', auth, async (req, res) => {
  const { menuItemId, quantity } = req.body;
  const { tableId } = req.params;

  try {
    let order = await db.query('SELECT id FROM orders WHERE table_id = $1 AND status = $2', [tableId, 'active']);
    if (order.rows.length === 0) {
      order = await db.query('INSERT INTO orders (table_id, status) VALUES ($1, $2) RETURNING *', [tableId, 'active']);
    }
    const orderId = order.rows[0].id;

    // Check if item exists in order
    const existing = await db.query('SELECT * FROM order_items WHERE order_id = $1 AND menu_item_id = $2', [orderId, menuItemId]);
    
    if (existing.rows.length > 0) {
      await db.query('UPDATE order_items SET quantity = quantity + $1 WHERE id = $2', [quantity, existing.rows[0].id]);
    } else {
      await db.query('INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES ($1, $2, $3)', [orderId, menuItemId, quantity]);
    }

    // Return updated items
    const updatedItems = await db.query(
      'SELECT oi.*, mi.name, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
      [orderId]
    );
    res.json({ items: updatedItems.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding item' });
  }
});

// Update item quantity
router.put('/:tableId/order/items/:itemId', auth, async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  try {
    await db.query('UPDATE order_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    
    // Get order ID to return all items
    const item = await db.query('SELECT order_id FROM order_items WHERE id = $1', [itemId]);
    const updatedItems = await db.query(
      'SELECT oi.*, mi.name, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
      [item.rows[0].order_id]
    );
    res.json({ items: updatedItems.rows });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete item
router.delete('/:tableId/order/items/:itemId', auth, async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await db.query('SELECT order_id FROM order_items WHERE id = $1', [itemId]);
    const orderId = item.rows[0].order_id;
    await db.query('DELETE FROM order_items WHERE id = $1', [itemId]);
    
    const updatedItems = await db.query(
      'SELECT oi.*, mi.name, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
      [orderId]
    );
    res.json({ items: updatedItems.rows });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Generate Bill
router.post('/:tableId/bill', auth, async (req, res) => {
  const { tableId } = req.params;
  const { discount_percentage } = req.body;
  
  try {
    const hotelRes = await db.query('SELECT gst_percentage FROM hotels WHERE id = $1', [req.user.hotel_id]);
    const gstRate = parseFloat(hotelRes.rows[0].gst_percentage || 5);

    const order = await db.query('SELECT id FROM orders WHERE table_id = $1 AND status = $2', [tableId, 'active']);
    if (order.rows.length === 0) return res.status(404).json({ message: 'No active order' });
    const orderId = order.rows[0].id;

    const items = await db.query(
      'SELECT oi.quantity, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
      [orderId]
    );

    const subtotal = items.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * (gstRate / 100);
    const initialTotal = subtotal + gst;
    const discount = parseFloat(discount_percentage) || 0;
    const finalAmount = initialTotal - (initialTotal * (discount / 100));

    const bill = await db.query(
      'INSERT INTO bills (order_id, total_amount, gst, final_amount, discount_percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderId, subtotal, gst, finalAmount, discount]
    );

    await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['completed', orderId]);

    const billItems = await db.query(
      'SELECT oi.quantity, mi.name, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
      [orderId]
    );

    res.json({
      ...bill.rows[0],
      subtotal: subtotal,
      total_amount: finalAmount,
      gst_percentage: gstRate,
      items: billItems.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Billing error' });
  }
});

// Rollback/Cancel Bill (Return to active order)
router.delete('/:tableId/bill/:billId', auth, async (req, res) => {
  const { tableId, billId } = req.params;
  try {
    const bill = await db.query('SELECT order_id FROM bills WHERE id = $1', [billId]);
    if (bill.rows.length === 0) return res.status(404).json({ message: 'Bill not found' });
    const orderId = bill.rows[0].order_id;

    await db.query('BEGIN');
    await db.query('DELETE FROM bills WHERE id = $1', [billId]);
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['active', orderId]);
    await db.query('COMMIT');

    res.json({ message: 'Bill rolled back, order is active again' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Rollback failed' });
  }
});

// Send notification
router.post('/:tableId/bill/send', auth, async (req, res) => {
  const { method, customerPhone, billId } = req.body;
  
  try {
     const hotelRes = await db.query('SELECT name FROM hotels WHERE id = $1', [req.user.hotel_id]);
     const hotelName = hotelRes.rows[0].name;

     const billRes = await db.query('SELECT * FROM bills WHERE id = $1', [billId]);
     const bill = billRes.rows[0];

     const itemsRes = await db.query(
        'SELECT mi.name, oi.quantity FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1',
        [bill.order_id]
     );
     const items = itemsRes.rows;

     // Generate Short Itemized Message (Optimized for 160 characters)
     let msg = `${hotelName} Bill #${billId}\n`;
     items.forEach(i => msg += `${i.name}x${i.quantity}\n`);
     msg += `Total: ₹${bill.final_amount}\nThanks for visiting!`;

     if (method === 'sms') {
        await sendSMS(customerPhone, msg);
     } else if (method === 'whatsapp') {
        // WhatsApp is handled via Direct Link on the frontend to keep it 100% free.
        console.log(`[Notification] WhatsApp link generated for ${customerPhone}. No SMS charge triggered.`);
     }

     res.json({ success: true, message: `Invoice transmitted via ${method.toUpperCase()}` });
  } catch (err) {
     console.error(err);
     res.status(500).json({ message: 'Error dispatching invoice' });
  }
});

// Delete table
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM tables WHERE id = $1 AND hotel_id = $2', [id, req.user.hotel_id]);
    res.json({ message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Mark bill as paid
router.put('/bill/:billId/pay', auth, async (req, res) => {
  const { billId } = req.params;
  const { method } = req.body; // 'upi', 'cash', 'card'
  try {
     const result = await db.query(
        'UPDATE bills SET is_paid = true, payment_method = $1 WHERE id = $2 RETURNING *',
        [method, billId]
     );
     if (result.rows.length === 0) return res.status(404).json({ message: 'Bill record not found' });
     res.json({ success: true, bill: result.rows[0] });
  } catch (err) {
     console.error(err);
     res.status(500).json({ message: 'Error updating payment status' });
  }
});

module.exports = router;
