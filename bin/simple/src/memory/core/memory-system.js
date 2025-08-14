export function memoryStatsToBackendStats(memoryStats) {
    return {
        entries: memoryStats.totalEntries,
        size: memoryStats.totalSize,
        lastModified: memoryStats.modified,
        namespaces: undefined,
    };
}
export function backendStatsToMemoryStats(backendStats) {
    return {
        totalEntries: backendStats.entries,
        totalSize: backendStats.size,
        cacheHits: 0,
        cacheMisses: 0,
        lastAccessed: backendStats.lastModified,
        created: Date.now(),
        modified: backendStats.lastModified,
    };
}
//# sourceMappingURL=memory-system.js.map