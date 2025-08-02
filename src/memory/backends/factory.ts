/**
 * @fileoverview Factory for creating memory backends.
 */

import type { BackendConfig, BackendInterface } from './base.backend';
import { JSONBackend } from './json.backend';
import { LanceDBBackend } from './lancedb.backend';
import { SQLiteBackend } from './sqlite.backend';

export class BackendFactory {
  static create(config: BackendConfig): BackendInterface {
    switch (config.type) {
      case 'lancedb':
        return new LanceDBBackend(config);
      case 'sqlite':
        return new SQLiteBackend(config);
      case 'json':
        return new JSONBackend(config);
      default:
        throw new Error(`Unknown backend type: ${config.type}`);
    }
  }
}
