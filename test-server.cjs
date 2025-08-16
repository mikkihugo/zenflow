#!/usr/bin/env node
/**
 * Simple test server to debug startup issues
 */
const express = require('express');
const { createTerminus } = require('@godaddy/terminus');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

console.log('🚀 Starting test server...');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('📦 Setting up middleware...');

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Compression
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Request logging
app.use(morgan('combined'));

console.log('✅ Middleware setup complete');

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(), 
    timestamp: new Date().toISOString() 
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Test server running' });
});

console.log('🌐 Creating server...');
const server = app.listen(3001, 'localhost', () => {
  console.log('🌐 Test server started on http://localhost:3001');
  console.log('✅ Health check: http://localhost:3001/api/health');
});

console.log('🛡️ Setting up terminus...');
// Setup terminus
createTerminus(server, {
  signals: ['SIGTERM', 'SIGINT'],
  timeout: 5000,
  healthChecks: {
    '/health': () => ({ status: 'ok' }),
  },
  onSignal: async () => {
    console.log('🔄 Graceful shutdown...');
  },
  logger: (msg, err) => {
    if (err) {
      console.error('Terminus:', msg, err);
    } else {
      console.log('Terminus:', msg);
    }
  }
});

console.log('🛡️ Terminus setup complete');
console.log('✅ Server fully initialized');
