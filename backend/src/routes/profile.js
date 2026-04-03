const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const gcs = require('../services/gcsService');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Auth verify middleware for any logged in user
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Authorization required' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Profile info
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      'SELECT u.id, u.name, u.email, u.role, h.id as hotel_id, h.name as hotel_name, h.upi_id, h.subscription_valid_until FROM users u LEFT JOIN hotels h ON u.id = h.owner_id WHERE u.id = $1',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fetch profile failed' });
  }
});

// Update Profile
router.put('/', authenticateToken, async (req, res) => {
  const { name, email, password, upi_id } = req.body;
  const userId = req.user.id;
  const hotelId = req.user.hotel_id;

  try {
    // Check email uniqueness if email changed
    if (email) {
      const emailRes = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (emailRes.rows.length > 0) return res.status(400).json({ message: 'Email address already in use' });
    }

    // Update user info
    let userQuery = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email)';
    const userParams = [name, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userQuery += ', password = $3 WHERE id = $4';
      userParams.push(hashedPassword, userId);
    } else {
      userQuery += ' WHERE id = $3';
      userParams.push(userId);
    }

    await db.query(userQuery, userParams);

    // Update hotel upi_id if provided
    if (upi_id !== undefined && hotelId) {
      await db.query('UPDATE hotels SET upi_id = $1 WHERE id = $2', [upi_id, hotelId]);
    }
    
    // Fetch updated user info (excluding password)
    const updated = await db.query(
      'SELECT u.name, u.email, u.role, h.id as hotel_id, h.name as hotel_name, h.upi_id, h.subscription_valid_until FROM users u LEFT JOIN hotels h ON u.id = h.owner_id WHERE u.id = $1',
      [userId]
    );
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: updated.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Update Hotel Logo (Owner)
router.put('/logo', authenticateToken, upload.single('logo'), async (req, res) => {
  const userId = req.user.id;
  const deleteExisting = req.body.deleteExisting === 'true';

  try {
    const hotelRes = await db.query('SELECT id, logo_url FROM hotels WHERE owner_id = $1', [userId]);
    if (hotelRes.rows.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    
    const hotelId = hotelRes.rows[0].id;
    const oldLogoUrl = hotelRes.rows[0].logo_url;
    let newLogoUrl = oldLogoUrl;

    if (deleteExisting) {
      if (oldLogoUrl) await gcs.deleteFile(oldLogoUrl);
      newLogoUrl = null;
    }

    if (req.file) {
      if (oldLogoUrl) await gcs.deleteFile(oldLogoUrl);
      newLogoUrl = await gcs.uploadFile(req.file);
    }

    await db.query('UPDATE hotels SET logo_url = $1 WHERE id = $2', [newLogoUrl, hotelId]);
    res.json({ success: true, message: 'Brand logo updated', logo_url: newLogoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update brand visuals' });
  }
});

module.exports = router;
