const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const router = express.Router();

// Get hotel profile
router.get('/', auth, async (req, res) => {
  try {
    const hotel = await db.query('SELECT * FROM hotels WHERE id = $1', [req.user.hotel_id]);
    res.json(hotel.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching hotel' });
  }
});

// Update hotel details (Owner only)
router.put('/', auth, async (req, res) => {
  const { name, address, upi_id, gst_percentage } = req.body;
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Only owners can modify hotel settings' });
  try {
    const updated = await db.query(
      'UPDATE hotels SET name = $1, address = $2, upi_id = $3, gst_percentage = $4 WHERE id = $5 RETURNING *',
      [name, address, upi_id, gst_percentage || 0, req.user.hotel_id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating hotel' });
  }
});

// STAFF MANAGEMENT (WAITERS)

// Get all waiters for a hotel
router.get('/waiters', auth, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Unauthorized' });
  try {
    const waiters = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE hotel_id = $1 AND role = $2',
      [req.user.hotel_id, 'waiter']
    );
    res.json(waiters.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// Add a waiter
router.post('/waiters', auth, async (req, res) => {
  const { name, email, password } = req.body;
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Unauthorized' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Staff email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const waiter = await db.query(
      'INSERT INTO users (name, email, password, role, hotel_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email',
      [name, email, hashed, 'waiter', req.user.hotel_id]
    );

    res.status(201).json(waiter.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error hiring staff' });
  }
});

// Remove a waiter
router.delete('/waiters/:id', auth, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Unauthorized' });
  try {
    await db.query('DELETE FROM users WHERE id = $1 AND hotel_id = $2 AND role = $3', [req.params.id, req.user.hotel_id, 'waiter']);
    res.json({ message: 'Staff member removed' });
  } catch (err) {
    res.status(500).json({ message: 'Fire failed' });
  }
});

module.exports = router;
