/**
 * Coordination Domain - OpenAPI 3 Schemas.
 *
 * Comprehensive schema definitions for Swagger autodoc generation.
 * Following Google API Design Guide standards.
 *
 * @file OpenAPI 3.0 compatible schemas for coordination domain.
 */
// Schema validation utilities (Google standard: explicit validation)
export const SchemaValidators = {
    isValidAgentId: (id) => /^[a-z]+-[0-9a-z]+-[0-9a-z]+$/.test(id),
    isValidTaskId: (id) => /^task-[a-z]+-[0-9a-z]+-[0-9a-z]+$/.test(id),
    isValidPriority: (priority) => priority >= 0 && priority <= 100,
    isValidWorkload: (workload) => workload >= 0 && workload <= 100,
};
