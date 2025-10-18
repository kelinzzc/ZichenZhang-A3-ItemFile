const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');

const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const categoryRoutes = require('./routes/categories');
const organizationRoutes = require('./routes/organizations');
const weatherRoutes = require('./routes/weather');

const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3002', 'http://127.0.0.1:3002', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Maximum 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Parse request body
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static('public'));

// Request logging
app.use(requestLogger);

// Database connection check middleware
app.use(async (req, res, next) => {
  const isConnected = await testConnection();
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database service is temporarily unavailable, please try again later',
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Charity Event Platform API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      events: '/api/events',
      registrations: '/api/registrations',
      categories: '/api/categories',
      organizations: '/api/organizations',
      weather: '/api/weather'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection() ? 'connected' : 'disconnected';
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/weather', weatherRoutes);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      events: {
        'GET /api/events': 'Get all events',
        'GET /api/events/:id': 'Get single event details (including registration records)',
        'POST /api/events': 'Create new event (admin side)',
        'PUT /api/events/:id': 'Update event (admin side)',
        'DELETE /api/events/:id': 'Delete event (admin side)'
      },
      registrations: {
        'GET /api/registrations': 'Get all registration records (admin side)',
        'GET /api/registrations/event/:eventId': 'Get event registration records',
        'POST /api/registrations': 'Create registration record',
        'DELETE /api/registrations/:id': 'Delete registration record (admin side)'
      },
      categories: {
        'GET /api/categories': 'Get all categories'
      },
      organizations: {
        'GET /api/organizations': 'Get all organizations'
      },
      weather: {
        'GET /api/weather': 'Get weather information'
      }
    }
  });
});

// Handle 404 - Endpoint not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint does not exist',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/events',
      'GET /api/events/:id',
      'POST /api/events',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'GET /api/registrations',
      'POST /api/registrations',
      'GET /api/categories',
      'GET /api/organizations',
      'GET /api/weather'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Startup
const server = app.listen(PORT, async () => {
  console.log(' Charity Event Platform API server started successfully');
  console.log(` Server running at: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Start time: ${new Date().toISOString()}`);
  
  // Test database connection
  const dbStatus = await testConnection();
  console.log(`🗄️  Database status: ${dbStatus ? '✅ Connected' : '❌ Connection failed'}`);
  
  console.log('\n📋 Available endpoints:');
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  API documentation: http://localhost:${PORT}/api`);
  console.log(`  Events API: http://localhost:${PORT}/api/events`);
  console.log(`  Registrations API: http://localhost:${PORT}/api/registrations`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, starting server shutdown...');
  server.close(() => {
    console.log('Server has been shut down');
    process.exit(0);
  });
});

module.exports = app;