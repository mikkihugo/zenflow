/**
 * Core Memory System Types and Interfaces.
 *
 * Provides central types and interfaces for the memory management system.
 * Including backend interfaces and core system types.
 */
/**
 * @file Memory management: memory-system.
 */
/**
 * Utility function to convert MemoryStats to BackendStats format
 * for compatibility with legacy code.
 *
 * @param memoryStats
 * @example
 */
export function memoryStatsToBackendStats(memoryStats) {
	return {
		entries: memoryStats.totalEntries,
		size: memoryStats.totalSize,
		lastModified: memoryStats.modified,
		namespaces: undefined, // Not tracked in MemoryStats
	};
}
/**
 * Utility function to convert BackendStats to MemoryStats format
 * for compatibility with BaseMemoryBackend.
 *
 * @param backendStats
 * @example
 */
export function backendStatsToMemoryStats(backendStats) {
	return {
		totalEntries: backendStats.entries,
		totalSize: backendStats.size,
		cacheHits: 0, // Not tracked in BackendStats
		cacheMisses: 0, // Not tracked in BackendStats
		lastAccessed: backendStats.lastModified,
		created: Date.now(), // Not tracked in BackendStats
		modified: backendStats.lastModified,
	};
}
