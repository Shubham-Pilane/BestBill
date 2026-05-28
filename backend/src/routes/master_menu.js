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
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        let queryStr = 'SELECT * FROM master_menu';
        const params = [];

        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            queryStr += ` WHERE LOWER(name) LIKE $${params.length} OR LOWER(category_name) LIKE $${params.length}`;
        }

        // If page is not specified, return all items without pagination
        if (isNaN(page)) {
            queryStr += ` ORDER BY name ASC`;
            const items = await db.query(queryStr, params);
            return res.json(items.rows);
        }

        // Count query for total items
        let countQueryStr = 'SELECT COUNT(*) FROM master_menu';
        const countParams = [];
        if (search) {
            countParams.push(`%${search.toLowerCase()}%`);
            countQueryStr += ` WHERE LOWER(name) LIKE $${countParams.length} OR LOWER(category_name) LIKE $${countParams.length}`;
        }
        const countRes = await db.query(countQueryStr, countParams);
        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        // Add limit and offset
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        queryStr += ` ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const itemsRes = await db.query(queryStr, params);
        res.json({
            items: itemsRes.rows,
            totalPages,
            currentPage: page,
            totalItems
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching master menu' });
    }
});

// Create/Update master item
router.post('/', auth, isAdmin, async (req, res) => {
    const { name, category_name, description, hotel_id, category_id, price } = req.body;
    try {
        const lowercaseName = name.trim().toLowerCase();
        
        let resolvedCategoryName = category_name;
        if (category_id) {
            const catRes = await db.query('SELECT name FROM categories WHERE id = $1', [category_id]);
            if (catRes.rows.length > 0) {
                resolvedCategoryName = catRes.rows[0].name;
            }
        }

        const item = await db.query(
            'INSERT INTO master_menu (name, category_name, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET category_name = $2, description = $3 RETURNING *',
            [lowercaseName, resolvedCategoryName || 'General', description]
        );
        const masterItem = item.rows[0];

        // If hotel_id, category_id, and price are provided, also link/attach it to the hotel
        if (hotel_id && category_id && price) {
            const existing = await db.query(
                'SELECT id FROM menu_items WHERE hotel_id = $1 AND (master_id = $2 OR LOWER(name) = LOWER($3))',
                [hotel_id, masterItem.id, lowercaseName]
            );
            if (existing.rows.length > 0) {
                await db.query(
                    'UPDATE menu_items SET price = $1, category_id = $2, name = $3, description = $4, master_id = $5 WHERE id = $6',
                    [price, category_id, lowercaseName, description, masterItem.id, existing.rows[0].id]
                );
            } else {
                await db.query(
                    'INSERT INTO menu_items (hotel_id, master_id, category_id, name, price, description) VALUES ($1, $2, $3, $4, $5, $6)',
                    [hotel_id, masterItem.id, category_id, lowercaseName, price, description]
                );
            }
        }

        res.status(201).json(masterItem);
    } catch (err) {
        console.error(err);
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

        // Check if item already exists for this hotel (either by master_id or by name)
        const existing = await db.query(
            'SELECT id FROM menu_items WHERE hotel_id = $1 AND (master_id = $2 OR LOWER(name) = LOWER($3))',
            [hotel_id, master_id, name]
        );
        
        let result;
        if (existing.rows.length > 0) {
            // Update the existing item to set master_id and other details
            result = await db.query(
                'UPDATE menu_items SET price = $1, category_id = $2, name = $3, description = $4, master_id = $5 WHERE id = $6 RETURNING *',
                [price, category_id, name, description, master_id, existing.rows[0].id]
            );
        } else {
            // Insert new item
            result = await db.query(
                'INSERT INTO menu_items (hotel_id, master_id, category_id, name, price, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [hotel_id, master_id, category_id, name, price, description]
            );
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('ATTACH ERROR:', err);
        res.status(500).json({ message: `Error attaching item to hotel: ${err.message}` });
    }
});

module.exports = router;
