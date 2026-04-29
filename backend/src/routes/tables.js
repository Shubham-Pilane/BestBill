const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();
const { sendSMS } = require('../services/smsService');

// Get all tables for a hotel
router.get('/', auth, async (req, res) => {
  try {
    const tables = await db.query(
      `SELECT t.*, o.id as active_order_id 
       FROM tables t 
       LEFT JOIN orders o ON o.table_id = t.id AND o.status = 'active'
       WHERE t.hotel_id = $1 
       ORDER BY t.floor ASC, LENGTH(t.table_number) ASC, t.table_number ASC`,
      [req.user.hotel_id]
    );
    res.json(tables.rows);
  } catch (err) {
    console.error('------- TABLES GET ERROR -------');
    console.error(err);
    console.error('--------------------------------');
    res.status(500).json({ message: 'Server error fetching tables', detail: err.message });
  }
});

// Create tables (Batch create)
router.post('/batch', auth, async (req, res) => {
  const { tableNumbers, floor } = req.body;
  if (!tableNumbers || tableNumbers.length === 0) return res.status(400).json({ message: 'No tables provided' });
  
  try {
    const floorValue = floor || 'Floor 1';
    for (const num of tableNumbers) {
       await db.query('INSERT INTO tables (hotel_id, table_number, floor) VALUES ($1, $2, $3)', [req.user.hotel_id, num, floorValue]);
    }
    res.status(201).json({ message: 'Tables created securely' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error establishing table infrastructure' });
  }
});

// Update table details
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { table_number, capacity, floor } = req.body;
  try {
    const result = await db.query(
      'UPDATE tables SET table_number = $1, capacity = $2, floor = $3 WHERE id = $4 AND hotel_id = $5 RETURNING *',
      [table_number, capacity, floor, id, req.user.hotel_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Table not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
       return res.status(400).json({ message: 'Table with this configuration already exists on this floor.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Swap Config protocol failed' });
  }
});

// Get order for a table
router.get('/:tableId/order', auth, async (req, res) => {
  const { tableId } = req.params;
  try {
    const query = `
      SELECT o.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id, 
                   'order_id', oi.order_id, 
                   'menu_item_id', oi.menu_item_id, 
                   'quantity', oi.quantity, 
                   'name', mi.name, 
                   'price', mi.price
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.table_id = $1 AND o.status = 'active'
      GROUP BY o.id
    `;
    const result = await db.query(query, [tableId]);
    
    if (result.rows.length === 0) {
      return res.json({ order: null, items: [] });
    }

    res.json({ order: result.rows[0], items: result.rows[0].items });
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
    const query1 = `
      WITH order_cte AS (
        INSERT INTO orders (table_id, status)
        SELECT $1, 'active'
        WHERE NOT EXISTS (SELECT 1 FROM orders WHERE table_id = $1 AND status = 'active')
        RETURNING id
      ),
      order_id_cte AS (
        SELECT id FROM order_cte
        UNION ALL
        SELECT id FROM orders WHERE table_id = $1 AND status = 'active'
      )
      INSERT INTO order_items (order_id, menu_item_id, quantity)
      SELECT (SELECT id FROM order_id_cte LIMIT 1), $2, $3
      ON CONFLICT (order_id, menu_item_id) DO UPDATE SET quantity = order_items.quantity + $3
      RETURNING order_id
    `;
    const res1 = await db.query(query1, [tableId, menuItemId, quantity]);
    const orderId = res1.rows[0].order_id;

    const query2 = `
      SELECT oi.*, mi.name, mi.price 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
    `;
    const updatedItems = await db.query(query2, [orderId]);
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
    const query1 = `UPDATE order_items SET quantity = $1 WHERE id = $2 RETURNING order_id`;
    const res1 = await db.query(query1, [quantity, itemId]);
    
    if (res1.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    const orderId = res1.rows[0].order_id;

    const query2 = `
      SELECT oi.*, mi.name, mi.price 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
    `;
    const updatedItems = await db.query(query2, [orderId]);
    res.json({ items: updatedItems.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete item
router.delete('/:tableId/order/items/:itemId', auth, async (req, res) => {
  const { itemId } = req.params;
  try {
    const query1 = `DELETE FROM order_items WHERE id = $1 RETURNING order_id`;
    const res1 = await db.query(query1, [itemId]);
    
    if (res1.rows.length === 0) {
      // Need to find the order ID to delete it (if we couldn't delete item, it's already gone)
      return res.json({ items: [], order_deleted: true });
    }
    
    const orderId = res1.rows[0].order_id;
    
    const query2 = `
      SELECT oi.*, mi.name, mi.price 
      FROM order_items oi 
      JOIN menu_items mi ON oi.menu_item_id = mi.id 
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
    `;
    const updatedItems = await db.query(query2, [orderId]);
    
    if (updatedItems.rows.length === 0) {
      // Need to find the order ID to delete it
      const item = await db.query('SELECT order_id FROM order_items WHERE id = $1', [itemId]); // Won't work because it's deleted!
      // Since it's deleted, we can just delete the order if it has no items.
      const orderIdQuery = await db.query('SELECT id FROM orders WHERE table_id = $1 AND status = $2', [req.params.tableId, 'active']);
      if (orderIdQuery.rows.length > 0) {
         const oId = orderIdQuery.rows[0].id;
         const checkItems = await db.query('SELECT id FROM order_items WHERE order_id = $1 LIMIT 1', [oId]);
         if (checkItems.rows.length === 0) {
           await db.query('DELETE FROM orders WHERE id = $1', [oId]);
           return res.json({ items: [], order_deleted: true });
         }
      }
      return res.json({ items: [], order_deleted: true });
    }

    res.json({ items: updatedItems.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Generate Bill
router.post('/:tableId/bill', auth, async (req, res) => {
  const { tableId } = req.params;
  const { discount_percentage } = req.body;
  
  try {
    const hotelRes = await db.query('SELECT name, phone, location, gst_percentage FROM hotels WHERE id = $1', [req.user.hotel_id]);
    const gstRate = parseFloat(hotelRes.rows[0].gst_percentage || 0);

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
      items: billItems.rows,
      hotel_name: hotelRes.rows[0].name,
      hotel_phone: hotelRes.rows[0].phone,
      hotel_location: hotelRes.rows[0].location
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

     // Generate Short Itemized Message
     let msg = `*--- ${hotelName.toUpperCase()} ---*\n`;
     msg += `Bill #${billId}\n`;
     items.forEach(i => msg += `${i.name} x ${i.quantity}\n`);
     msg += `Total: ₹${bill.final_amount}\n`;
     msg += `Thanks for visiting!`;

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

// Swap table (Transfer active order)
router.post('/:tableId/swap', auth, async (req, res) => {
  const { tableId } = req.params;
  const { targetTableId } = req.body;
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    // Check if source has active order
    const sourceOrder = await client.query('SELECT id FROM orders WHERE table_id = $1 AND status = $2', [tableId, 'active']);
    if (sourceOrder.rows.length === 0) return res.status(400).json({ message: 'No active order to swap' });
    
    // Check if target has active order
    const targetOrder = await client.query('SELECT id FROM orders WHERE table_id = $1 AND status = $2', [targetTableId, 'active']);
    if (targetOrder.rows.length > 0) return res.status(400).json({ message: 'Target table is busy' });

    // Transfer order
    await client.query('UPDATE orders SET table_id = $1 WHERE id = $2', [targetTableId, sourceOrder.rows[0].id]);
    
    await client.query('COMMIT');
    res.json({ message: 'Table successfully swapped' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Swap failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
