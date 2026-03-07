import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { testConnection } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import sensorRoutes from './routes/sensors.js';
import otaRoutes from './routes/ota.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import projectRoutes from './routes/projects.js';

// Import services
import { startMqttBroker } from './services/mqttBroker.js';

// Create Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      mqtt: {
        port: config.mqtt.port,
        websocketPort: config.mqtt.websocketPort,
      },
      api: {
        rateLimit: config.rateLimit,
      },
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/ota', otaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = config.isProd ? 'Internal server error' : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: message,
  });
});

// Initialize app
export const initializeApp = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('⚠️ Database not connected - running in demo mode');
      // Don't fail - allow running in demo mode
    }
    
    // Start MQTT broker (don't fail if ports are in use)
    try {
      await startMqttBroker();
    } catch (mqttError) {
      if (mqttError.code === 'EADDRINUSE') {
        console.log('⚠️ MQTT/WebSocket ports already in use, skipping broker startup');
      } else {
        console.error('Failed to start MQTT broker:', mqttError.message);
      }
    }
    
    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    // Don't throw - allow running in limited mode
  }
};

export default app;
