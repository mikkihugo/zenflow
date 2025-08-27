export const config = {
    windowMs: 60000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests',
    statusCode: 429,
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable legacy X-RateLimit-* headers
};
