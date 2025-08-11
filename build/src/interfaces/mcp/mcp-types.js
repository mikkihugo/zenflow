/**
 * Shared MCP Type Definitions.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */
export function createOutcome(spec, start, result) {
    return { ok: true, tool: spec.id || spec.name, durationMs: Date.now() - start, data: result };
}
export function createErrorOutcome(spec, start, error) {
    const err = error;
    return {
        ok: false,
        tool: spec.id || spec.name,
        durationMs: Date.now() - start,
        error: { message: err?.message || String(error), code: err?.code, stack: err?.stack },
    };
}
