const config: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests',
  statusCode: 429,
};
