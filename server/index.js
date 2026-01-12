const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });

connectDB();

const app = express();

// ✅ CORS (FIXED)
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://mahakalitextiles.netlify.app",
      "http://localhost:3000"
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

app.use(express.json());

// API Routes
app.use('/api/employees', employeeRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Mahakali Textiles API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
