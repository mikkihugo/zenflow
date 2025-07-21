"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryIndexer = void 0;
/**
 * Simple index implementation
 */
class SimpleIndex {
    constructor() {
        this.index = new Map();
    }
    get(key) {
        return this.index.get(key) || new Set();
    }
    add(key, entryId) {
        if (!this.index.has(key)) {
            this.index.set(key, new Set());
        }
        this.index.get(key).add(entryId);
    }
    remove(key, entryId) {
        const set = this.index.get(key);
        if (set) {
            set.delete(entryId);
            if (set.size === 0) {
                this.index.delete(key);
            }
        }
    }
    clear() {
        this.index.clear();
    }
    keys() {
        return Array.from(this.index.keys());
    }
}
/**
 * Memory indexer for efficient querying
 */
class MemoryIndexer {
    constructor(logger) {
        this.logger = logger;
        this.entries = new Map();
        this.agentIndex = new SimpleIndex();
        this.sessionIndex = new SimpleIndex();
        this.typeIndex = new SimpleIndex();
        this.tagIndex = new SimpleIndex();
        this.timeIndex = new Map(); // id -> timestamp
    }
    /**
     * Builds index from a list of entries
     */
    async buildIndex(entries) {
        this.logger.info('Building memory index', { entries: entries.length });
        this.clear();
        for (const entry of entries) {
            this.addEntry(entry);
        }
        this.logger.info('Memory index built', {
            totalEntries: this.entries.size,
            agents: this.agentIndex.keys().length,
            sessions: this.sessionIndex.keys().length,
            types: this.typeIndex.keys().length,
            tags: this.tagIndex.keys().length,
        });
    }
    /**
     * Adds an entry to the index
     */
    addEntry(entry) {
        // Store entry
        this.entries.set(entry.id, entry);
        // Update indexes
        this.agentIndex.add(entry.agentId, entry.id);
        this.sessionIndex.add(entry.sessionId, entry.id);
        this.typeIndex.add(entry.type, entry.id);
        for (const tag of entry.tags) {
            this.tagIndex.add(tag, entry.id);
        }
        this.timeIndex.set(entry.id, entry.timestamp.getTime());
    }
    /**
     * Updates an entry in the index
     */
    updateEntry(entry) {
        const existing = this.entries.get(entry.id);
        if (existing) {
            this.removeEntry(entry.id);
        }
        this.addEntry(entry);
    }
    /**
     * Removes an entry from the index
     */
    removeEntry(id) {
        const entry = this.entries.get(id);
        if (!entry) {
            return;
        }
        // Remove from indexes
        this.agentIndex.remove(entry.agentId, id);
        this.sessionIndex.remove(entry.sessionId, id);
        this.typeIndex.remove(entry.type, id);
        for (const tag of entry.tags) {
            this.tagIndex.remove(tag, id);
        }
        this.timeIndex.delete(id);
        this.entries.delete(id);
    }
    /**
     * Searches entries using the index
     */
    search(query) {
        let resultIds;
        // Apply index-based filters
        if (query.agentId) {
            resultIds = this.intersectSets(resultIds, this.agentIndex.get(query.agentId));
        }
        if (query.sessionId) {
            resultIds = this.intersectSets(resultIds, this.sessionIndex.get(query.sessionId));
        }
        if (query.type) {
            resultIds = this.intersectSets(resultIds, this.typeIndex.get(query.type));
        }
        if (query.tags && query.tags.length > 0) {
            const tagSets = query.tags.map(tag => this.tagIndex.get(tag));
            const unionSet = this.unionSets(...tagSets);
            resultIds = this.intersectSets(resultIds, unionSet);
        }
        // If no filters applied, get all entries
        if (!resultIds) {
            resultIds = new Set(this.entries.keys());
        }
        // Convert IDs to entries
        const results = [];
        for (const id of resultIds) {
            const entry = this.entries.get(id);
            if (entry) {
                results.push(entry);
            }
        }
        // Sort by timestamp (newest first)
        results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return results;
    }
    /**
     * Gets index metrics
     */
    getMetrics() {
        return {
            totalEntries: this.entries.size,
            indexSizes: {
                agents: this.agentIndex.keys().length,
                sessions: this.sessionIndex.keys().length,
                types: this.typeIndex.keys().length,
                tags: this.tagIndex.keys().length,
            },
        };
    }
    /**
     * Clears all indexes
     */
    clear() {
        this.entries.clear();
        this.agentIndex.clear();
        this.sessionIndex.clear();
        this.typeIndex.clear();
        this.tagIndex.clear();
        this.timeIndex.clear();
    }
    intersectSets(set1, set2) {
        if (!set1) {
            return new Set(set2);
        }
        const result = new Set();
        for (const item of set1) {
            if (set2.has(item)) {
                result.add(item);
            }
        }
        return result;
    }
    unionSets(...sets) {
        const result = new Set();
        for (const set of sets) {
            for (const item of set) {
                result.add(item);
            }
        }
        return result;
    }
}
exports.MemoryIndexer = MemoryIndexer;
