/**
 * App Module
 * Converted from JavaScript to TypeScript
 */

import express from 'express';

const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.status(200).send({ status: 'healthy' }));
export default app;
