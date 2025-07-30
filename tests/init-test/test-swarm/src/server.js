const _express = require('express');
const _helmet = require('helmet');
const _cors = require('cors');
const _rateLimit = require('express-rate-limit');
const { logger } = require('./utils/logger');
const { initializeDatabase } = require('./models/database');
const { errorHandler } = require('./middleware/errorHandler');
const { metricsMiddleware, registerMetrics } = require('./middleware/metrics');
const _authRoutes = require('./routes/auth');
const _userRoutes = require('./routes/users');
const _healthRoutes = require('./routes/health');
require('dotenv').config();
const _app = express();
const _PORT = process.env.PORT ?? 3000;
// Security middleware
app.use(helmet());
app.use(cors());
// Rate limiting
const _limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS)  ?? 15 * 60 * 1000,
max: parseInt(process.env.RATE_LIMIT_MAX)  ?? 100,
message: 'Too many requests from this IP'
})
app.use('/api/', limiter)
// Body parsing
app.use(express.json())
app.use(express.urlencoded(
// {
  extended;
// }
))
// Metrics middleware
if (process.env.ENABLE_METRICS === 'true') {
  app.use(metricsMiddleware);
  registerMetrics(app);
// }
// Request logging
app.use((req, res, next) => {
  const _start = Date.now();
  res.on('finish', () => {
    const _duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);
// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error);
});
// Error handling
app.use(errorHandler);
// Initialize database and start server
async function start() {
  try {
  // await initializeDatabase();
    logger.info('Database initialized successfully');
    const _server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment);
      logger.info(`Metrics enabled);
      logger.info(`ruv-swarm enabled);
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server);
    process.exit(1);
  //   }
// }
if (require.main === module) {
  start();
// }
module.exports = app;
