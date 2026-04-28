const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    next();
};

// Get all master items
router.get('/', auth, async (req, res) => {
    try {
        const items = await db.query('SELECT * FROM master_menu ORDER BY name ASC');
        res.json(items.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching master menu' });
    }
});

// Create/Update master item
router.post('/', auth, isAdmin, async (req, res) => {
    const { name, category_name, description } = req.body;
    try {
        const item = await db.query(
            'INSERT INTO master_menu (name, category_name, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET category_name = $2, description = $3 RETURNING *',
            [name, category_name, description]
        );
        res.status(201).json(item.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error managing master item' });
    }
});

// Attach master item to a specific hotel
router.post('/attach', auth, isAdmin, async (req, res) => {
    const { hotel_id, master_id, price, category_id } = req.body;
    try {
        // Get master item info
        const masterItem = await db.query('SELECT * FROM master_menu WHERE id = $1', [master_id]);
        if (masterItem.rows.length === 0) return res.status(404).json({ message: 'Master item not found' });
        
        const { name, description } = masterItem.rows[0];

        // Check if item already exists for this hotel
        const existing = await db.query('SELECT id FROM menu_items WHERE hotel_id = $1 AND master_id = $2', [hotel_id, master_id]);
        
        let result;
        if (existing.rows.length > 0) {
            // Update
            result = await db.query(
                'UPDATE menu_items SET price = $1, category_id = $2, name = $3, description = $4 WHERE id = $5 RETURNING *',
                [price, category_id, name, description, existing.rows[0].id]
            );
        } else {
            // Insert
            result = await db.query(
                'INSERT INTO menu_items (hotel_id, master_id, category_id, name, price, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [hotel_id, master_id, category_id, name, price, description]
            );
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error attaching item to hotel' });
    }
});

module.exports = router;
