const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ["https://mahakali-textiles.netlify.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/employees', employeeRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🚀 Mahakali Textiles API is running locally!');
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
