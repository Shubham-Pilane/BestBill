const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.url}`);
  next();
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`[CONTACT FORM] Message from ${name} (${email}): ${message}`);
  res.json({ success: true, message: 'Thank you for contacting us. We will get back to you shortly!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BestBill marketing backend is running.' });
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Marketing backend running on port ${PORT}`);
});
