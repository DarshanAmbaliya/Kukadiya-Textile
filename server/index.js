const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

// 1. Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// 2. Connect to MongoDB
connectDB();

const app = express();

// 3. Middleware Configuration
// Unified CORS: Allows both local testing and your live Netlify site
app.use(cors({
  origin: ["https://mahakali-textiles.netlify.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// 4. API Routes (Must be defined BEFORE static files)
app.use('/api/employees', employeeRoutes);

// 5. Serve Frontend (React)
// This logic handles showing your website on the Railway URL
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
  // Point to the 'build' folder inside your client directory
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));

  // FIX: Express 5.0 requires '/*' instead of '*' to avoid the PathError
  app.get('/*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Local development root route
  app.get('/', (req, res) => {
    res.send('🚀 Mahakali Textiles API is running locally!');
  });
}

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Deployment Environment: ${process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local'}`);
});