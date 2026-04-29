const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all rooms for a hotel
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await db.query(
      `SELECT r.*, o.id as active_order_id, o.owner_message, o.guest_note, o.is_delivered
       FROM rooms r 
       LEFT JOIN (
           SELECT DISTINCT ON (room_id) id, room_id, owner_message, guest_note, is_delivered 
           FROM orders 
           WHERE status = 'active' 
           ORDER BY room_id, id DESC
       ) o ON o.room_id = r.id
       WHERE r.hotel_id = $1 
       ORDER BY r.floor ASC, r.room_number ASC`,
      [req.user.hotel_id]
    );
    res.json(rooms.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
});

// NEW: Get all recent guest orders (including those from checked-out rooms)
router.get('/guest-orders-all', auth, async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT 
          o.*, 
          r.room_number,
          r.guest_name,
          r.status as room_status,
          (SELECT SUM(oi.quantity * mi.price) 
           FROM order_items oi 
           JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = o.id) as total_amount,
          (SELECT STRING_AGG(quantity || 'x ' || name, ', ') 
           FROM order_items oi 
           JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = o.id) as items_summary
       FROM orders o
       JOIN rooms r ON o.room_id = r.id
       WHERE r.hotel_id = $1
       AND EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id)
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [req.user.hotel_id]
    );
    res.json(orders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching guest order history' });
  }
});

// Create rooms (Batch create)
router.post('/batch', auth, async (req, res) => {
  const { roomConfigs } = req.body; // roomConfigs: [{floor: 'Floor 1', count: 10}, ...]
  if (!roomConfigs || roomConfigs.length === 0) return res.status(400).json({ message: 'No room configuration provided' });
  
  try {
    for (const config of roomConfigs) {
        const { floor, count } = config;
        const floorNumStr = floor.match(/\d+/) ? floor.match(/\d+/)[0] : '1';
        const floorInt = parseInt(floorNumStr);
        
        for (let i = 1; i <= count; i++) {
            const roomNumber = `${floorInt}${i.toString().padStart(2, '0')}`;
            await db.query(
                'INSERT INTO rooms (hotel_id, room_number, floor, room_name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', 
                [req.user.hotel_id, roomNumber, floor, roomNumber]
            );
        }
    }
    res.status(201).json({ message: 'Rooms initialized successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error initializing room infrastructure' });
  }
});

// Update room details (rename or update stay)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { room_number, room_name, floor, status, booking_days, total_cost, guest_name, guest_phone } = req.body;
  try {
    const result = await db.query(
      `UPDATE rooms SET 
       room_number = COALESCE($1, room_number), 
       room_name = COALESCE($2, room_name), 
       floor = COALESCE($3, floor), 
       status = COALESCE($4, status),
       booking_days = COALESCE($5, booking_days),
       total_cost = COALESCE($6, total_cost),
       guest_name = COALESCE($7, guest_name),
       guest_phone = COALESCE($8, guest_phone)
       WHERE id = $9 AND hotel_id = $10 RETURNING *`,
      [room_number, room_name, floor, status, booking_days, total_cost, guest_name, guest_phone, id, req.user.hotel_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
       return res.status(400).json({ message: 'Room number already exists.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete room
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM rooms WHERE id = $1 AND hotel_id = $2', [id, req.user.hotel_id]);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Book a room
router.post('/:id/book', auth, async (req, res) => {
    const { id } = req.params;
    const { guest_name, guest_phone, booking_days, total_cost } = req.body;
    try {
        await db.query('BEGIN');
        
        const result = await db.query(
            `UPDATE rooms SET 
             status = 'occupied', 
             guest_name = $1, 
             guest_phone = $2, 
             booking_days = $3, 
             total_cost = $4,
             check_in_date = CURRENT_TIMESTAMP
             WHERE id = $5 AND hotel_id = $6 RETURNING *`,
            [guest_name, guest_phone, booking_days, total_cost, id, req.user.hotel_id]
        );

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: 'Room not found' });
        }

        // Prevent duplicate active orders by completing any previous dangling ones
        await db.query("UPDATE orders SET status = 'completed' WHERE room_id = $1 AND status = 'active'", [id]);

        // Initialize active order for billing parity - matching our existing schema
        await db.query(
            'INSERT INTO orders (room_id, status) VALUES ($1, $2)',
            [id, 'active']
        );

        await db.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Booking failed' });
    }
});

// Checkout / Clear room
router.post('/:id/checkout', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `UPDATE rooms SET 
             status = 'available', 
             guest_name = NULL, 
             guest_phone = NULL, 
             booking_days = 0, 
             total_cost = 0,
             check_in_date = NULL
             WHERE id = $1 AND hotel_id = $2 RETURNING *`,
            [id, req.user.hotel_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Checkout failed' });
    }
});

// Get order for a room
router.get('/:roomId/order', auth, async (req, res) => {
    const { roomId } = req.params;
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
        WHERE o.room_id = $1 AND o.status = 'active'
        GROUP BY o.id
      `;
      const result = await db.query(query, [roomId]);
      
      if (result.rows.length === 0) {
        return res.json({ order: null, items: [] });
      }

      res.json({ order: result.rows[0], items: result.rows[0].items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error fetching order' });
    }
});
  
// Add item to room order
router.post('/:roomId/order', auth, async (req, res) => {
    const { menuItemId, quantity } = req.body;
    const { roomId } = req.params;
  
    try {
      const query1 = `
        WITH order_cte AS (
          INSERT INTO orders (room_id, status)
          SELECT $1, 'active'
          WHERE NOT EXISTS (SELECT 1 FROM orders WHERE room_id = $1 AND status = 'active')
          RETURNING id
        ),
        order_id_cte AS (
          SELECT id FROM order_cte
          UNION ALL
          SELECT id FROM orders WHERE room_id = $1 AND status = 'active'
        )
        INSERT INTO order_items (order_id, menu_item_id, quantity)
        SELECT (SELECT id FROM order_id_cte LIMIT 1), $2, $3
        ON CONFLICT (order_id, menu_item_id) DO UPDATE SET quantity = order_items.quantity + $3
        RETURNING order_id
      `;
      const res1 = await db.query(query1, [roomId, menuItemId, quantity]);
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
router.put('/:roomId/order/items/:itemId', auth, async (req, res) => {
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
router.delete('/:roomId/order/items/:itemId', auth, async (req, res) => {
    const { itemId } = req.params;
    try {
      const query1 = `DELETE FROM order_items WHERE id = $1 RETURNING order_id`;
      const res1 = await db.query(query1, [itemId]);
      
      if (res1.rows.length === 0) {
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
      res.json({ items: updatedItems.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Delete failed' });
    }
});

// Generate Room Bill
router.post('/:roomId/bill', auth, async (req, res) => {
    const { roomId } = req.params;
    const { discount_percentage } = req.body;
    
    try {
      const hotelRes = await db.query('SELECT name, phone, location, gst_percentage FROM hotels WHERE id = $1', [req.user.hotel_id]);
      const gstRate = parseFloat(hotelRes.rows[0].gst_percentage || 0);
  
      const roomRes = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
      const room = roomRes.rows[0];
      const roomCharge = parseFloat(room.total_cost || 0);
  
      const order = await db.query('SELECT id FROM orders WHERE room_id = $1 AND status = $2', [roomId, 'active']);
      if (order.rows.length === 0) return res.status(404).json({ message: 'No active order' });
      const orderId = order.rows[0].id;
  
      const itemsRes = await db.query(
        'SELECT mi.name, SUM(oi.quantity) as quantity, mi.price FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = $1 GROUP BY mi.id, mi.name, mi.price',
        [orderId]
      );
      const items = itemsRes.rows;
  
      const foodSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
      const subtotal = foodSubtotal + roomCharge;
      const gst = subtotal * (gstRate / 100);
      const initialTotal = subtotal + gst;
      const discount = parseFloat(discount_percentage) || 0;
      const finalAmount = initialTotal - (initialTotal * (discount / 100));
  
      const bill = await db.query(
        'INSERT INTO bills (order_id, total_amount, gst, final_amount, discount_percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [orderId, subtotal, gst, finalAmount, discount]
      );
  
      await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['completed', orderId]);
      
      res.json({
        ...bill.rows[0],
        subtotal: subtotal,
        final_amount: finalAmount,
        room_charge: roomCharge,
        guest_name: room.guest_name,
        room_number: room.room_number,
        gst_percentage: gstRate,
        items: items, 
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
router.delete('/:roomId/bill/:billId', auth, async (req, res) => {
    const { roomId, billId } = req.params;
    try {
      const bill = await db.query('SELECT order_id FROM bills WHERE id = $1', [billId]);
      if (bill.rows.length === 0) return res.status(404).json({ message: 'Bill not found' });
      const orderId = bill.rows[0].order_id;
  
      await db.query('BEGIN');
      await db.query('DELETE FROM bills WHERE id = $1', [billId]);
      await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['active', orderId]);
      
      // We must re-occupy the room if it was cleared
      const orderRes = await db.query('SELECT room_id FROM orders WHERE id = $1', [orderId]);
      if (orderRes.rows[0].room_id) {
          await db.query("UPDATE rooms SET status = 'occupied' WHERE id = $1", [orderRes.rows[0].room_id]);
      }
      
      await db.query('COMMIT');
  
      res.json({ message: 'Bill rolled back, order is active again' });
    } catch (err) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Rollback failed' });
    }
});

// Send message to guest order
router.put('/orders/:orderId/message', auth, async (req, res) => {
  const { orderId } = req.params;
  const { message } = req.body;
  try {
    await db.query('UPDATE orders SET owner_message = $1 WHERE id = $2', [message, orderId]);
    res.json({ success: true, message: 'Message transmitted to guest' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark guest order as delivered
router.put('/orders/:orderId/deliver', auth, async (req, res) => {
  const { orderId } = req.params;
  try {
    await db.query('UPDATE orders SET is_delivered = true WHERE id = $1', [orderId]);
    res.json({ success: true, message: 'Order marked as delivered' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery status' });
  }
});

// Owner View Chat History
router.get('/orders/:orderId/chat', auth, async (req, res) => {
  try {
    const chats = await db.query(
      'SELECT * FROM order_chats WHERE order_id = $1 ORDER BY created_at ASC',
      [req.params.orderId]
    );
    res.json(chats.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat' });
  }
});

// Owner Send Reply
router.post('/orders/:orderId/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    await db.query(
      'INSERT INTO order_chats (order_id, sender, message) VALUES ($1, $2, $3)',
      [req.params.orderId, 'owner', message]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error sending reply' });
  }
});

module.exports = router;
