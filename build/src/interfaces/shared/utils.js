/**
 * @file Provides shared utility functions for use across different interfaces.
 *
 * ⚠️  SHARED INTERFACE LAYER - NEVER REMOVE ⚠️.
 *
 * This module is part of the interfaces/shared system that is ACTIVELY USED:
 * - src/interfaces/shared/config.ts - Extensively references shared interface configuration
 * - src/core/interface-manager.ts - Uses centralConfig?.interfaces?.shared?.theme and settings
 * - src/database/providers/database-providers.ts - Imports from interfaces/shared/types.
 *
 * Static analysis may not detect usage due to configuration-based references and
 * the shared interface architecture pattern. This module provides consistent
 * behavior for common interface tasks like logging, formatting, and validation.
 * @usage CRITICAL - Shared interface utilities used by configuration and management systems
 * @referencedBy src/interfaces/shared/config.ts, src/core/interface-manager.ts, src/database/providers/database-providers.ts
 */
export function formatLog(message) {
    return `[LOG] ${new Date().toISOString()}: ${message}`;
}
