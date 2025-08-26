/**
 * @fileoverview Architecture Package
 *
 * Provides architecture validation and domain boundary management for Claude Code Zen.
 * Moved from core to maintain clean separation between generic architecture
 * validation and SAFe-specific coordination.
 */

export * from "./domain-boundary-validator";
export * from "./verify-domain-boundary-validator";
