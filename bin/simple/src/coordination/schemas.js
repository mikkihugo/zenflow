export const SchemaValidators = {
    isValidAgentId: (id) => /^[a-z]+-[0-9a-z]+-[0-9a-z]+$/.test(id),
    isValidTaskId: (id) => /^task-[a-z]+-[0-9a-z]+-[0-9a-z]+$/.test(id),
    isValidPriority: (priority) => priority >= 0 && priority <= 100,
    isValidWorkload: (workload) => workload >= 0 && workload <= 100,
};
//# sourceMappingURL=schemas.js.map