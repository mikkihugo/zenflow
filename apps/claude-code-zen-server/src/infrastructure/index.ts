/**
 * Infrastructure barrel (no facade)
 *
 * This module intentionally avoids exposing a coordinating "infrastructure facade".
 * As agreed, consumers should access strategic components directly (database,
 * coordination, wasm, web services) rather than a monolithic infra entrypoint.
 *
 * Kept only as a stable location to re-export a few concrete utilities used by
 * web services. Do not add a system-wide facade here.
 */

// Minimal, explicit re-exports. Prefer importing concrete modules directly.
export type { ProcessInfo } from './process/web.manager';
export { WebProcessManager } from './process/web.manager';
export type { WebSession } from './session.manager';
export { WebSessionManager } from './session.manager';

// Deprecated: No coordinating infrastructure facade is provided here by design.
// If you need health/metrics/lifecycle, implement them in the specific service
// or use package-level utilities from @claude-zen/* directly.
