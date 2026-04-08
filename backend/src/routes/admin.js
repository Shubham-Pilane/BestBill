const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/db');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure Multer for Memory Storage (GCS)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all hotels
router.get('/hotels', adminAuth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT h.*, u.name as owner_name, u.email as owner_email,
      (SELECT COUNT(*) FROM tables WHERE hotel_id = h.id) as total_tables
      FROM hotels h 
      JOIN users u ON h.owner_id = u.id 
      ORDER BY h.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving hotels' });
  }
});

// Onboard New Hotel with File Upload
router.post('/onboard', adminAuth, upload.single('logo'), async (req, res) => {
  const { hotelName, ownerName, email, password, phone, location, subscriptionAmount, subscriptionValidity } = req.body;
  
  let logoUrl = null;
  if (req.file) {
    try {
      const gcs = require('../services/gcsService');
      logoUrl = await gcs.uploadFile(req.file);
    } catch (err) {
      console.error('GCS Upload Error:', err);
      // Fallback or continue? User wants GCS, so if it fails, maybe we should stop.
      return res.status(500).json({ message: 'Logo upload to Cloud Storage failed' });
    }
  }

  const client = await db.getClient();

  try {
    const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query('BEGIN');
    
    const userRes = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [ownerName, email, hashedPassword, 'owner']
    );
    const userId = userRes.rows[0].id;

    const hotelRes = await client.query(
      'INSERT INTO hotels (owner_id, name, phone, location, logo_url, subscription_amount, subscription_valid_until, gst_percentage) VALUES ($1, $2, $3, $4, $5, $6, NOW() + $7::interval, 0) RETURNING id',
      [userId, hotelName, phone, location, logoUrl, subscriptionAmount || 0, `${subscriptionValidity || 1} months`]
    );
    const hotelId = hotelRes.rows[0].id;

    // Link the owner user to this newly instantiated hotel
    await client.query('UPDATE users SET hotel_id = $1 WHERE id = $2', [hotelId, userId]);

    await client.query(
      'INSERT INTO subscription_history (hotel_id, amount, months_added, valid_until) VALUES ($1, $2, $3, (SELECT subscription_valid_until FROM hotels WHERE id = $1))',
      [hotelId, subscriptionAmount || 0, subscriptionValidity || 1]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Hotel Onboarded Successfully', hotel_id: hotelId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Onboarding failed' });
  } finally {
    client.release();
  }
});

// Delete Hotel
router.delete('/hotels/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const findOwner = await db.query('SELECT owner_id FROM hotels WHERE id = $1', [parseInt(id)]);
    if (findOwner.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    const owner_id = findOwner.rows[0].owner_id;
    await db.query('DELETE FROM users WHERE id = $1', [owner_id]);
    res.json({ message: 'Hotel and Owner Account Purged' });
  } catch (err) {
    res.status(500).json({ message: 'Purge failed' });
  }
});

// Update Subscription Plan
router.put('/hotels/:id/subscription', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { amount, validityDate } = req.body;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE hotels SET subscription_amount = $1, subscription_valid_until = $2::timestamp WHERE id = $3`,
      [amount, `${validityDate} 23:59:59`, parseInt(id)]
    );
    await client.query(
      'INSERT INTO subscription_history (hotel_id, amount, months_added, valid_until) VALUES ($1, $2, $3, (SELECT subscription_valid_until FROM hotels WHERE id = $1))',
      [parseInt(id), amount, 0]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Subscription securely extended' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to negotiate subscription terms' });
  } finally {
    client.release();
  }
});

// Get Stats
router.get('/hotels/:id/stats', adminAuth, async (req, res) => {
  const { id } = req.params;
  const hotelId = parseInt(id);
  try {
    const hotelResult = await db.query('SELECT * FROM hotels WHERE id = $1', [hotelId]);
    if (hotelResult.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });

    const [menuRes, tablesRes, billsRes] = await Promise.all([
      db.query('SELECT m.*, c.name as category_name FROM menu_items m JOIN categories c ON m.category_id = c.id WHERE c.hotel_id = $1', [hotelId]),
      db.query('SELECT * FROM tables WHERE hotel_id = $1', [hotelId]),
      db.query(`
        SELECT b.*, o.created_at as order_time, t.table_number 
        FROM bills b 
        JOIN orders o ON b.order_id = o.id 
        JOIN tables t ON o.table_id = t.id 
        WHERE t.hotel_id = $1 
        ORDER BY b.created_at DESC`, [hotelId])
    ]);

    const bills = billsRes.rows || [];
    res.json({
      hotel: hotelResult.rows[0],
      menu: menuRes.rows || [],
      tables: tablesRes.rows || [],
      bills: bills,
      financials: {
        total_revenue: bills.reduce((acc, b) => acc + parseFloat(b.final_amount || 0), 0),
        total_gst: bills.reduce((acc, b) => acc + parseFloat(b.gst || 0), 0)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Ecosystem synchronization error' });
  }
});

// Get Subscription Analytics
router.get('/subscriptions', adminAuth, async (req, res) => {
  try {
    const totalAmountRes = await db.query('SELECT SUM(amount) as total FROM subscription_history');
    const totalCollected = parseFloat(totalAmountRes.rows[0]?.total || 0);

    const historyRes = await db.query(`
      SELECT sh.*, h.name as hotel_name 
      FROM subscription_history sh
      JOIN hotels h ON sh.hotel_id = h.id
      ORDER BY sh.created_at DESC
    `);

    const currentPlansRes = await db.query(`
      SELECT h.id, h.name as hotel_name, h.subscription_amount, h.subscription_valid_until
      FROM hotels h
      ORDER BY h.subscription_valid_until DESC
    `);

    res.json({
      total_collected: totalCollected,
      history: historyRes.rows,
      active_plans: currentPlansRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve subscription records' });
  }
});

// Update Hotel Logo (Super Admin)
router.put('/hotels/:id/logo', adminAuth, upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  const hotelId = parseInt(id);
  const deleteExisting = req.body.deleteExisting === 'true';

  try {
    const existingRes = await db.query('SELECT logo_url FROM hotels WHERE id = $1', [hotelId]);
    if (existingRes.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    const oldLogoUrl = existingRes.rows[0].logo_url;

    let newLogoUrl = oldLogoUrl;

    if (deleteExisting) {
      if (oldLogoUrl) {
         const gcs = require('../services/gcsService');
         await gcs.deleteFile(oldLogoUrl);
      }
      newLogoUrl = null;
    }

    if (req.file) {
      // Remove old logo if it exists
      if (oldLogoUrl) {
         const gcs = require('../services/gcsService');
         await gcs.deleteFile(oldLogoUrl);
      }
      
      const gcs = require('../services/gcsService');
      newLogoUrl = await gcs.uploadFile(req.file);
    }

    await db.query('UPDATE hotels SET logo_url = $1 WHERE id = $2', [newLogoUrl, hotelId]);
    res.json({ success: true, message: 'Logo successfully updated', logo_url: newLogoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update brand visuals' });
  }
});

// Toggle Hotel Service (Stop/Start)
router.put('/hotels/:id/toggle-service', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE hotels SET is_service_stopped = NOT COALESCE(is_service_stopped, false) WHERE id = $1 RETURNING is_service_stopped',
      [parseInt(id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    const stopped = result.rows[0].is_service_stopped;
    res.json({ success: true, is_service_stopped: stopped, message: stopped ? 'Service has been stopped' : 'Service has been resumed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to toggle service status' });
  }
});

module.exports = router;
