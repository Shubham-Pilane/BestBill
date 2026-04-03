const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories WHERE hotel_id = $1 ORDER BY name ASC', [req.user.hotel_id]);
    res.json(categories.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// Create category
router.post('/categories', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = await db.query(
      'INSERT INTO categories (hotel_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.hotel_id, name]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating category' });
  }
});

// Update category
router.put('/categories/:id', auth, async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  try {
    const updated = await db.query(
      'UPDATE categories SET name = $1 WHERE id = $2 AND hotel_id = $3 RETURNING *',
      [name, id, req.user.hotel_id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete category
router.delete('/categories/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM categories WHERE id = $1 AND hotel_id = $2', [id, req.user.hotel_id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Get menu items
router.get('/items', auth, async (req, res) => {
  try {
    const items = await db.query(
      'SELECT mi.*, c.name as category_name FROM menu_items mi JOIN categories c ON mi.category_id = c.id WHERE c.hotel_id = $1 ORDER BY mi.name ASC',
      [req.user.hotel_id]
    );
    res.json(items.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// Create menu item
router.post('/items', auth, async (req, res) => {
  const { name, price, category_id, description, is_available } = req.body;
  try {
    const newItem = await db.query(
      'INSERT INTO menu_items (category_id, name, price, description, is_available) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category_id, name, price, description, is_available ?? true]
    );
    res.status(201).json(newItem.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating menu item' });
  }
});

// Update menu item
router.put('/items/:id', auth, async (req, res) => {
  const { name, price, category_id, description, is_available } = req.body;
  const { id } = req.params;
  try {
    const updated = await db.query(
      'UPDATE menu_items SET name = $1, price = $2, category_id = $3, description = $4, is_available = $5 WHERE id = $6 RETURNING *',
      [name, price, category_id, description, is_available, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete menu item
router.delete('/items/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM menu_items WHERE id = $1', [id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
