const express = require('express');
const db = require('../db/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all rooms for a hotel
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await db.query(
      `SELECT * FROM rooms 
       WHERE hotel_id = $1 
       ORDER BY floor ASC, room_number ASC`,
      [req.user.hotel_id]
    );
    res.json(rooms.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching rooms' });
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

// Update room details (rename)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { room_number, room_name, floor, status } = req.body;
  try {
    const result = await db.query(
      'UPDATE rooms SET room_number = $1, room_name = $2, floor = $3, status = $4 WHERE id = $5 AND hotel_id = $6 RETURNING *',
      [room_number, room_name, floor, status || 'available', id, req.user.hotel_id]
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

module.exports = router;
