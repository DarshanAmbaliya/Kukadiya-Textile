const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ✅ CORS Configuration
// This allows your Netlify frontend to talk to this Railway backend
const allowedOrigins = [
  "https://mahakalitextiles.netlify.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/employees', employeeRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('🚀 Mahakali Textiles API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});