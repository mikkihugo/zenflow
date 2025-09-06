// Global Express Request augmentation for request metadata

import type { RequestMetadata } from '../infrastructure/middleware/logging';

declare global {
  namespace Express {
    interface Request {
      metadata?: RequestMetadata;
    }
  }
}

export {};