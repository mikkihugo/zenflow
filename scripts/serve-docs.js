#!/usr/bin/env node

import { getLogger } from '@logtape/logtape';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = getLogger(['script', 'docs-server']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DOCS_PORT || 3000;
const DOCS_PATH = path.join(__dirname, '..', 'docs', 'api');

// Check if docs exist
if (!fs.existsSync(DOCS_PATH)) {
  logger.error('📚 Documentation not found! Run: npm run docs:generate');
  process.exit(1);
}

// Serve documentation at /docs route
app.use(
  '/docs',
  express.static(DOCS_PATH, {
    index: 'index.html',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    },
  }),
);

// Redirect /docs to /docs/
app.get('/docs', (req, res) => {
  res.redirect('/docs/');
});

// Root route with info
app.get('/', (req, res) => {
  res.json({
    message: 'Claude Code Zen Documentation Server',
    endpoints: {
      docs: '/docs - API Documentation',
      health: '/health - Server Health',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs_available: fs.existsSync(DOCS_PATH),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Try /docs for documentation or / for endpoints',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`📚 Documentation server running on http://localhost:${PORT}`);
  logger.info(`📖 API Documentation: http://localhost:${PORT}/docs`);
  logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
  logger.info('');
  logger.info('💡 To regenerate docs: npm run docs:generate');
});
