const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { syncSchema } = require('./db/migrate');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API RESPONSE] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
  });
  console.log(`[API REQUEST] ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotel', require('./routes/hotel'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/guest', require('./routes/guest'));
app.use('/api/master-menu', require('./routes/master_menu'));

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BestBill API is running (Master Menu Update)' });
});

const PORT = process.env.PORT || 8080;
const db = require('./db/db');

// --- AUTO CLEANUP TASK (30 DAYS) ---
const runCleanupTask = async () => {
    try {
        console.log('[CLEANUP] Starting daily history cleanup...');
        // Delete orders older than 30 days that are marked delivered or completed
        const resOrders = await db.query(
            "DELETE FROM orders WHERE (is_delivered = true OR status = 'completed') AND created_at < NOW() - INTERVAL '30 days'"
        );
        // Delete billing history older than 30 days
        const resBills = await db.query(
            "DELETE FROM bills WHERE created_at < NOW() - INTERVAL '30 days'"
        );
        console.log(`[CLEANUP] Success: Removed ${resOrders.rowCount} old orders and ${resBills.rowCount} old bills.`);
    } catch (err) {
        console.error('[CLEANUP] Error during cleanup:', err.message);
    }
};

// Run migrations before listening
syncSchema().then(() => {
    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error('------- GLOBAL ERROR HANDLER -------');
        console.error('PATH:', req.path);
        console.error('METHOD:', req.method);
        console.error('ERROR:', err.message);
        console.error('STACK:', err.stack);
        console.error('------------------------------------');
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        // Run first cleanup on start
        runCleanupTask();
        // Set up daily interval (24 hours)
        setInterval(runCleanupTask, 1000 * 60 * 60 * 24);
    }).on('error', (err) => {
        console.error('Server Listen Error:', err.message);
    });
});

// Anti-exit guard
setInterval(() => {}, 1000 * 60);
