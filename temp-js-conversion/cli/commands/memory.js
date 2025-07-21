"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCommand = exports.SimpleMemoryManager = void 0;
const chalk_1 = require("chalk");
/**
 * Memory management commands
 */
const commander_1 = require("commander");
const node_fs_1 = require("node:fs");
class SimpleMemoryManager {
    constructor() {
        this.filePath = "./memory/memory-store.json";
        this.data = {};
    }
    async load() {
        try {
            const content = await node_fs_1.promises.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(content);
        }
        catch {
            // File doesn't exist yet
            this.data = {};
        }
    }
    async save() {
        await node_fs_1.promises.mkdir("./memory", { recursive: true });
        await node_fs_1.promises.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    }
    async store(key, value, namespace = "default") {
        await this.load();
        if (!this.data[namespace]) {
            this.data[namespace] = [];
        }
        // Remove existing entry with same key
        this.data[namespace] = this.data[namespace].filter(e => e.key !== key);
        // Add new entry
        this.data[namespace].push({
            key,
            value,
            namespace,
            timestamp: Date.now()
        });
        await this.save();
    }
    async query(search, namespace) {
        await this.load();
        const results = [];
        const namespaces = namespace ? [namespace] : Object.keys(this.data);
        for (const ns of namespaces) {
            if (this.data[ns]) {
                for (const entry of this.data[ns]) {
                    if (entry.key.includes(search) || entry.value.includes(search)) {
                        results.push(entry);
                    }
                }
            }
        }
        return results;
    }
    async getStats() {
        await this.load();
        let totalEntries = 0;
        const namespaceStats = {};
        for (const [namespace, entries] of Object.entries(this.data)) {
            namespaceStats[namespace] = entries.length;
            totalEntries += entries.length;
        }
        return {
            totalEntries,
            namespaces: Object.keys(this.data).length,
            namespaceStats,
            sizeBytes: new TextEncoder().encode(JSON.stringify(this.data)).length
        };
    }
    async exportData(filePath) {
        await this.load();
        await node_fs_1.promises.writeFile(filePath, JSON.stringify(this.data, null, 2));
    }
    async importData(filePath) {
        const content = await node_fs_1.promises.readFile(filePath, 'utf8');
        this.data = JSON.parse(content);
        await this.save();
    }
    async cleanup(daysOld = 30) {
        await this.load();
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        let removedCount = 0;
        for (const namespace of Object.keys(this.data)) {
            const before = this.data[namespace].length;
            this.data[namespace] = this.data[namespace].filter(e => e.timestamp > cutoffTime);
            removedCount += before - this.data[namespace].length;
        }
        await this.save();
        return removedCount;
    }
}
exports.SimpleMemoryManager = SimpleMemoryManager;
exports.memoryCommand = new commander_1.Command()
    .name('memory')
    .description('Manage memory bank')
    .action(() => {
    exports.memoryCommand.help();
});
// Store command
exports.memoryCommand
    .command('store')
    .description('Store information in memory')
    .arguments('<key> <value>')
    .option('-n, --namespace <namespace>', 'Target namespace', 'default')
    .action(async (key, value, options) => {
    try {
        const memory = new SimpleMemoryManager();
        await memory.store(key, value, options.namespace);
        console.log(chalk_1.default.green('✅ Stored successfully'));
        console.log(`📝 Key: ${key}`);
        console.log(`📦 Namespace: ${options.namespace}`);
        console.log(`💾 Size: ${new TextEncoder().encode(value).length} bytes`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to store:'), error.message);
    }
});
// Query command
exports.memoryCommand
    .command('query')
    .description('Search memory entries')
    .arguments('<search>')
    .option('-n, --namespace <namespace>', 'Filter by namespace')
    .option('-l, --limit <limit>', 'Limit results', '10')
    .action(async (search, options) => {
    try {
        const memory = new SimpleMemoryManager();
        const results = await memory.query(search, options.namespace);
        if (results.length === 0) {
            console.log(chalk_1.default.yellow('No results found'));
            return;
        }
        console.log(chalk_1.default.green(`✅ Found ${results.length} results:`));
        const limited = results.slice(0, parseInt(options.limit));
        for (const entry of limited) {
            console.log(chalk_1.default.blue(`\n📌 ${entry.key}`));
            console.log(`   Namespace: ${entry.namespace}`);
            console.log(`   Value: ${entry.value.substring(0, 100)}${entry.value.length > 100 ? '...' : ''}`);
            console.log(`   Stored: ${new Date(entry.timestamp).toLocaleString()}`);
        }
        if (results.length > parseInt(options.limit)) {
            console.log(chalk_1.default.gray(`\n... and ${results.length - parseInt(options.limit)} more results`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to query:'), error.message);
    }
});
// Export command
exports.memoryCommand
    .command('export')
    .description('Export memory to file')
    .arguments('<file>')
    .action(async (file, options) => {
    try {
        const memory = new SimpleMemoryManager();
        await memory.exportData(file);
        const stats = await memory.getStats();
        console.log(chalk_1.default.green('✅ Memory exported successfully'));
        console.log(`📁 File: ${file}`);
        console.log(`📊 Entries: ${stats.totalEntries}`);
        console.log(`💾 Size: ${(stats.sizeBytes / 1024).toFixed(2)} KB`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to export:'), error.message);
    }
});
// Import command
exports.memoryCommand
    .command('import')
    .description('Import memory from file')
    .arguments('<file>')
    .action(async (file, options) => {
    try {
        const memory = new SimpleMemoryManager();
        await memory.importData(file);
        const stats = await memory.getStats();
        console.log(chalk_1.default.green('✅ Memory imported successfully'));
        console.log(`📁 File: ${file}`);
        console.log(`📊 Entries: ${stats.totalEntries}`);
        console.log(`🗂️  Namespaces: ${stats.namespaces}`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to import:'), error.message);
    }
});
// Stats command
exports.memoryCommand
    .command('stats')
    .description('Show memory statistics')
    .action(async () => {
    try {
        const memory = new SimpleMemoryManager();
        const stats = await memory.getStats();
        console.log(chalk_1.default.green('📊 Memory Bank Statistics:'));
        console.log(`   Total Entries: ${stats.totalEntries}`);
        console.log(`   Namespaces: ${stats.namespaces}`);
        console.log(`   Size: ${(stats.sizeBytes / 1024).toFixed(2)} KB`);
        if (stats.namespaces > 0) {
            console.log(chalk_1.default.blue('\n📁 Namespace Breakdown:'));
            for (const [namespace, count] of Object.entries(stats.namespaceStats)) {
                console.log(`   ${namespace}: ${count} entries`);
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to get stats:'), error.message);
    }
});
// Cleanup command
exports.memoryCommand
    .command('cleanup')
    .description('Clean up old entries')
    .option('-d, --days <days>', 'Entries older than n days', '30')
    .action(async (options) => {
    try {
        const memory = new SimpleMemoryManager();
        const removed = await memory.cleanup(parseInt(options.days));
        console.log(chalk_1.default.green('✅ Cleanup completed'));
        console.log(`🗑️  Removed: ${removed} entries older than ${options.days} days`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to cleanup:'), error.message);
    }
});
