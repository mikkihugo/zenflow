/**
 * @fileoverview Factory for creating memory backends.
 */

import { BackendInterface, BackendConfig } from './base.backend';
import { LanceDBBackend } from './lancedb.backend';
import { SQLiteBackend } from './sqlite.backend';
import { JSONBackend } from './json.backend';

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
