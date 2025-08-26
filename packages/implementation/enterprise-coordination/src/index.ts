/**
 * @fileoverview Enterprise Coordination Implementation Package
 *
 * Complete enterprise coordination implementation providing:
 * - SAFE methodology coordination (ARTs, PIs, LPM)
 * - SPARC workflow integration
 * - Project and development management
 * - Value stream and epic coordination
 *
 * This package provides the real implementation that @claude-zen/enterprise
 * strategic facade delegates to when available.
 */

// Re-export everything from coordination
export * from "./coordination";

// Export coordination sub-module for modular imports
export * as coordination from "./coordination";
