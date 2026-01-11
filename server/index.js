const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });

connectDB();

const app = express();

app.use(cors({
  origin: ["https://mahakali-textiles.netlify.app", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

app.use('/api/employees', employeeRoutes);

// ✅ SIMPLE HEALTH CHECK
app.get('/', (req, res) => {
  res.send('🚀 Mahakali Textiles API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
