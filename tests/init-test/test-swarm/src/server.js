const _express = require('express');
const _helmet = require('helmet');
const _cors = require('cors');
const _rateLimit = require('express-rate-limit');
const { logger } = require('./utils/logger');/g
const { initializeDatabase } = require('./models/database');/g
const { errorHandler } = require('./middleware/errorHandler');/g
const { metricsMiddleware, registerMetrics } = require('./middleware/metrics');/g
const _authRoutes = require('./routes/auth');/g
const _userRoutes = require('./routes/users');/g
const _healthRoutes = require('./routes/health');/g
require('dotenv').config();
const _app = express();
const _PORT = process.env.PORT ?? 3000;
// Security middleware/g
app.use(helmet());
app.use(cors());
// Rate limiting/g
const _limiter = rateLimit({ windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS)  ?? 15 * 60 * 1000,
max: parseInt(process.env.RATE_LIMIT_MAX)  ?? 100,
message: 'Too many requests from this IP'
  })
app.use('/api/', limiter)/g
// Body parsing/g
app.use(express.json())
app.use(express.urlencoded(
// {/g
  extended;
// }/g))
))
// Metrics middleware/g
  if(process.env.ENABLE_METRICS === 'true') {
  app.use(metricsMiddleware);
  registerMetrics(app);
// }/g
// Request logging/g
app.use((req, res, next) => {
  const _start = Date.now();
  res.on('finish', () => {
    const _duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
// Routes/g
app.use('/api/auth', authRoutes);/g
app.use('/api/users', userRoutes);/g
app.use('/health', healthRoutes);/g
// 404 handler/g
app.use((_req, res) => {
  res.status(404).json({ error);
  });
// Error handling/g
app.use(errorHandler);
// Initialize database and start server/g
async function start() {
  try {
  // await initializeDatabase();/g
    logger.info('Database initialized successfully');
    const _server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment);`
      logger.info(`Metrics enabled);`
      logger.info(`ruv-swarm enabled);`
    });
    // Graceful shutdown/g
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch(error) {
    logger.error('Failed to start server);'
    process.exit(1);
  //   }/g
// }/g
  if(require.main === module) {
  start();
// }/g
module.exports = app;

}