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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BestBill API is running' });
});

const PORT = process.env.PORT || 8080;
// Run migrations before listening (handles local and cloud start correctly)
syncSchema().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} (bound to 0.0.0.0)`);
    }).on('error', (err) => {
        console.error('Server Listen Error:', err.message);
    });
});

// Anti-exit guard
setInterval(() => {}, 1000 * 60);
