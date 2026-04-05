const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register (Owner by default)
router.post('/register', upload.single('logo'), async (req, res) => {
  const { name, email, password, hotelName, phone, address } = req.body;

  try {
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let logoUrl = null;
    if (req.file) {
      try {
        const gcs = require('../services/gcsService');
        logoUrl = await gcs.uploadFile(req.file);
      } catch (err) {
        console.error('Logo upload failed during registration:', err);
        // Continue without logo if upload fails
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, 'owner']
    );

    const userId = newUser.rows[0].id;

    const hotelRes = await db.query(
      'INSERT INTO hotels (owner_id, name, phone, location, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, hotelName || `${name}'s Hotel`, phone || null, address || null, logoUrl]
    );
    const newHotelId = hotelRes.rows[0].id;

    // Link the user directly to the new hotel
    await db.query('UPDATE users SET hotel_id = $1 WHERE id = $2', [newHotelId, userId]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await db.query(
      `SELECT u.*, 
       COALESCE(h.name, h2.name) as hotel_name, 
       COALESCE(h.upi_id, h2.upi_id) as upi_id, 
       COALESCE(h.subscription_valid_until, h2.subscription_valid_until) as subscription_valid_until,
       COALESCE(h.is_service_stopped, h2.is_service_stopped, false) as is_service_stopped,
       COALESCE(u.hotel_id, h2.id) as resolved_hotel_id
       FROM users u 
       LEFT JOIN hotels h ON u.hotel_id = h.id 
       LEFT JOIN hotels h2 ON h2.owner_id = u.id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`[AUTH] Password mismatch for ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // --- Plan & Service Validation (skip for admin) ---
    if (user.role !== 'admin') {
      // Check if service is stopped by super admin
      if (user.is_service_stopped) {
        return res.status(403).json({ 
          message: 'SERVICE_BLOCKED',
          reason: 'Your hotel service has been temporarily suspended by the administrator. Please contact customer care.',
          contact_phone: '9822401802',
          contact_email: 'bestbillcustomercare@gmail.com'
        });
      }

      // Check if subscription plan has expired
      if (user.subscription_valid_until) {
        const validUntil = new Date(user.subscription_valid_until);
        const now = new Date();
        if (now > validUntil) {
          return res.status(403).json({ 
            message: 'PLAN_EXPIRED',
            reason: 'Your subscription plan has expired. Please renew your plan to continue using BestBill.',
            contact_phone: '9822401802',
            contact_email: 'bestbillcustomercare@gmail.com'
          });
        }
      }
    }

    const finalHotelId = user.resolved_hotel_id;

    const token = jwt.sign(
      { id: user.id, hotel_id: finalHotelId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, 
        hotel_id: finalHotelId,
        hotel_name: user.hotel_name,
        upi_id: user.upi_id,
        subscription_valid_until: user.subscription_valid_until
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
