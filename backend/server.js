const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { seedDB } = require('./config/seeder');
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
app.use(cors({
  origin: '*', // Allow all origins for seamless development testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets or logs placeholder
app.get('/', (req, res) => {
  res.json({
    name: "WoodNest Premium Furniture eCommerce API",
    version: "1.0.0",
    status: "Active",
    time: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Express Server Error:', err.message);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Launch database connection & seed then listen
const startServer = async () => {
  try {
    // 1. Connect Database (Atlas MongoDB or JSON fallback engine)
    await connectDB();

    // 2. Pre-populate items if database is clean
    await seedDB();

    // 3. Start listening
    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`🛋️  WoodNest Luxury Server is now live!`);
      console.log(`🌐 Port: http://localhost:${PORT}`);
      console.log(`🏷️  DB Connection Mode: ${require('./config/db').dbEngine.getMode().toUpperCase()}`);
      console.log(`========================================`);
    });
  } catch (err) {
    console.error('❌ Critical startup failure:', err);
    process.exit(1);
  }
};

startServer();
