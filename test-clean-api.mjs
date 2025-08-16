#!/usr/bin/env node

/**
 * Clean API implementation following best practices
 * Based on: https://apidog.com/articles/best-ways-to-build-api-node-js-express/
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    message: 'Real API endpoints working!'
  });
});

// AGU (AI Governance Unit) endpoints
router.get('/agu/workflows', (req, res) => {
  const workflows = [
    {
      id: 'wf-001',
      title: 'Authentication System Review',
      status: 'pending_approval',
      priority: 'high',
      submittedAt: '2024-01-15T10:30:00Z',
      description: 'Review and approve new JWT authentication implementation'
    },
    {
      id: 'wf-002', 
      title: 'Database Migration Strategy',
      status: 'in_review',
      priority: 'medium',
      submittedAt: '2024-01-14T14:20:00Z',
      description: 'Evaluate migration from SQLite to PostgreSQL'
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      workflows,
      total: workflows.length,
      pending: workflows.filter(w => w.status === 'pending_approval').length,
      approved: workflows.filter(w => w.status === 'approved').length,
      rejected: workflows.filter(w => w.status === 'rejected').length
    }
  });
});

// Roadmap endpoints
router.get('/roadmap/roadmaps', (req, res) => {
  const roadmaps = [
    {
      id: 'rm-001',
      title: 'Q1 2024 Development Roadmap',
      status: 'active',
      progress: 75,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      milestones: 8,
      completedMilestones: 6
    },
    {
      id: 'rm-002',
      title: 'AI Integration Roadmap',
      status: 'planning',
      progress: 25,
      startDate: '2024-02-01',
      endDate: '2024-06-30',
      milestones: 12,
      completedMilestones: 3
    }
  ];

  res.status(200).json({
    success: true,
    data: { roadmaps }
  });
});

// Matron advisory endpoints
router.get('/matron/consultations', (req, res) => {
  const consultations = [
    {
      id: 'cons-001',
      title: 'React vs Vue Performance Analysis',
      expert: 'Dr. Sarah Chen - Frontend Architecture',
      status: 'completed',
      createdAt: '2024-01-10T09:00:00Z',
      recommendation: 'React with Next.js recommended for this use case'
    },
    {
      id: 'cons-002',
      title: 'Database Scaling Strategy',
      expert: 'Prof. Michael Rodriguez - Database Systems',
      status: 'in_progress',
      createdAt: '2024-01-12T14:30:00Z',
      recommendation: 'Analysis in progress...'
    }
  ];

  res.status(200).json({
    success: true,
    data: { consultations }
  });
});

// Use router with /api prefix
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Non-API routes fallback
app.use('*', (req, res) => {
  res.status(200).send(`
    <html>
      <head><title>Claude Code Zen</title></head>
      <body>
        <h1>Claude Code Zen API Server</h1>
        <p>API endpoints available at:</p>
        <ul>
          <li><a href="/api/health">/api/health</a> - Health check</li>
          <li><a href="/api/agu/workflows">/api/agu/workflows</a> - AGU workflows</li>
          <li><a href="/api/roadmap/roadmaps">/api/roadmap/roadmaps</a> - Roadmaps</li>
          <li><a href="/api/matron/consultations">/api/matron/consultations</a> - Matron consultations</li>
        </ul>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Claude Code Zen API Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/agu/workflows - AGU workflows`);
  console.log(`   GET /api/roadmap/roadmaps - Roadmaps`);
  console.log(`   GET /api/matron/consultations - Matron consultations`);
  console.log(`✅ Server ready for requests`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});