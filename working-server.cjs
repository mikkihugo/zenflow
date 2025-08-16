#!/usr/bin/env node
/**
 * Working API Server with Terminus - CommonJS version to avoid import issues
 */
const express = require('express');
const { createTerminus } = require('@godaddy/terminus');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const healthcheck = require('express-healthcheck');

console.log('🚀 Starting Claude Code Zen API Server...');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Production middleware stack
console.log('🔒 Setting up production middleware...');

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID']
}));

// Compression
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API/Swagger
}));

// Request logging
app.use(morgan('combined'));

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

console.log('✅ Production middleware configured');

// Health check endpoint
app.use('/api/health', healthcheck({
  healthy: () => ({ 
    status: 'healthy', 
    uptime: process.uptime(), 
    timestamp: new Date().toISOString(),
    version: '1.0.0-alpha.44',
    environment: process.env.NODE_ENV || 'development'
  })
}));

// Basic API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    server: 'Claude Code Zen API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Claude Code Zen',
    version: '1.0.0-alpha.44',
    description: 'AI swarm orchestration platform with neural networks and web dashboard',
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      info: '/api/info'
    },
    features: ['Production Middleware', 'Rate Limiting', 'Security Headers', 'Graceful Shutdown']
  });
});

// Workspace-like endpoint
app.get('/api/workspace/files', (req, res) => {
  res.json({
    message: 'Workspace API endpoint',
    path: req.query.path || '.',
    files: [
      { name: 'package.json', type: 'file', size: 12345 },
      { name: 'src', type: 'directory', size: null },
      { name: 'README.md', type: 'file', size: 6789 }
    ],
    timestamp: new Date().toISOString()
  });
});

// Default routes
app.get('/', (req, res) => {
  res.json({
    message: 'Claude Code Zen API Server',
    version: '1.0.0-alpha.44',
    endpoints: ['/api/health', '/api/status', '/api/info', '/api/workspace/files'],
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

console.log('✅ API routes configured');

// Create server
const server = app.listen(port, host, () => {
  console.log(`🌐 Claude Code Zen API Server started on http://${host}:${port}`);
  console.log(`🏥 Health check: http://${host}:${port}/api/health`);
  console.log(`📊 Status: http://${host}:${port}/api/status`);
  console.log(`📂 Workspace: http://${host}:${port}/api/workspace/files`);
  console.log('🎯 Ready for development');
});

// Setup terminus for graceful shutdown
createTerminus(server, {
  signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
  timeout: 30000, // 30 seconds
  healthChecks: {
    '/health': () => ({ status: 'healthy', timestamp: new Date().toISOString() }),
    '/api/health': () => ({ status: 'healthy', timestamp: new Date().toISOString() }),
  },
  onSignal: async () => {
    console.log('🔄 Graceful shutdown initiated...');
    console.log('✅ Graceful shutdown preparations complete');
  },
  onShutdown: async () => {
    console.log('🏁 Server shutdown complete');
  },
  logger: (msg, err) => {
    if (err) {
      console.error('🔄 Terminus:', msg, err);
    } else {
      console.log('🔄 Terminus:', msg);
    }
  }
});

console.log('🛡️ Graceful shutdown enabled via @godaddy/terminus');
console.log('✅ Server fully initialized and ready');

// Handle unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
