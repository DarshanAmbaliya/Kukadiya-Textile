const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API routes (Keep these above the static file logic)
app.use('/api/employees', employeeRoutes);

// --- SERVE FRONTEND ---
// Check if we are in production (Railway)
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
  // Point to the 'build' folder inside your client directory
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));

  // Handle any page refresh or direct URL access
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Local development root route
  app.get('/', (req, res) => {
    res.send('🚀 Mahakali Textiles API is running locally!');
  });
}
app.use(cors({
  origin: ["https://mahakali-textiles.netlify.app", "http://localhost:3000"]
}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});