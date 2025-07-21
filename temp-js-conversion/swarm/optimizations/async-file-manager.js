"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncFileManager = void 0;
/**
 * Async File Manager
 * Handles non-blocking file operations with queuing
 */
const node_fs_1 = require("node:fs");
const promises_1 = require("node:stream/promises");
const node_fs_2 = require("node:fs");
const node_stream_1 = require("node:stream");
const node_path_1 = require("node:path");
const p_queue_1 = require("p-queue");
const logger_js_1 = require("../../core/logger.js");
class AsyncFileManager {
    constructor(concurrency = {
        write: 10,
        read: 20
    }) {
        this.concurrency = concurrency;
        this.metrics = {
            operations: new Map(),
            totalBytes: 0,
            errors: 0
        };
        this.writeQueue = new p_queue_1.default({ concurrency: this.concurrency.write });
        this.readQueue = new p_queue_1.default({ concurrency: this.concurrency.read });
        // Use test-safe logger configuration
        const loggerConfig = process.env.CLAUDE_FLOW_ENV === 'test'
            ? { level: 'error', format: 'json', destination: 'console' }
            : { level: 'info', format: 'json', destination: 'console' };
        this.logger = new logger_js_1.Logger(loggerConfig, { component: 'AsyncFileManager' });
    }
    async writeFile(path, data) {
        const start = Date.now();
        return await this.writeQueue.add(async () => {
            try {
                // Ensure directory exists
                await this.ensureDirectory((0, node_path_1.dirname)(path));
                // Use streaming for large files
                if (data.length > 1024 * 1024) { // > 1MB
                    await this.streamWrite(path, data);
                }
                else {
                    await node_fs_1.promises.writeFile(path, data, 'utf8');
                }
                const duration = Date.now() - start;
                const size = Buffer.byteLength(data);
                this.trackOperation('write', size);
                return {
                    path,
                    operation: 'write',
                    success: true,
                    duration,
                    size
                };
            }
            catch (error) {
                this.metrics.errors++;
                this.logger.error('Failed to write file', { path, error });
                return {
                    path,
                    operation: 'write',
                    success: false,
                    duration: Date.now() - start,
                    error: error
                };
            }
        });
    }
    async readFile(path) {
        const start = Date.now();
        return await this.readQueue.add(async () => {
            try {
                const data = await node_fs_1.promises.readFile(path, 'utf8');
                const duration = Date.now() - start;
                const size = Buffer.byteLength(data);
                this.trackOperation('read', size);
                return {
                    path,
                    operation: 'read',
                    success: true,
                    duration,
                    size,
                    data
                };
            }
            catch (error) {
                this.metrics.errors++;
                this.logger.error('Failed to read file', { path, error });
                return {
                    path,
                    operation: 'read',
                    success: false,
                    duration: Date.now() - start,
                    error: error
                };
            }
        });
    }
    async writeJSON(path, data, pretty = true) {
        const jsonString = pretty
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);
        return this.writeFile(path, jsonString);
    }
    async readJSON(path) {
        const result = await this.readFile(path);
        if (result.success && result.data) {
            try {
                const parsed = JSON.parse(result.data);
                return { ...result, data: parsed };
            }
            catch (error) {
                return {
                    ...result,
                    success: false,
                    error: new Error('Invalid JSON format')
                };
            }
        }
        return result;
    }
    async deleteFile(path) {
        const start = Date.now();
        return this.writeQueue.add(async () => {
            try {
                await node_fs_1.promises.unlink(path);
                this.trackOperation('delete', 0);
                return {
                    path,
                    operation: 'delete',
                    success: true,
                    duration: Date.now() - start
                };
            }
            catch (error) {
                this.metrics.errors++;
                this.logger.error('Failed to delete file', { path, error });
                return {
                    path,
                    operation: 'delete',
                    success: false,
                    duration: Date.now() - start,
                    error: error
                };
            }
        });
    }
    async ensureDirectory(path) {
        const start = Date.now();
        try {
            await node_fs_1.promises.mkdir(path, { recursive: true });
            this.trackOperation('mkdir', 0);
            return {
                path,
                operation: 'mkdir',
                success: true,
                duration: Date.now() - start
            };
        }
        catch (error) {
            this.metrics.errors++;
            this.logger.error('Failed to create directory', { path, error });
            return {
                path,
                operation: 'mkdir',
                success: false,
                duration: Date.now() - start,
                error: error
            };
        }
    }
    async ensureDirectories(paths) {
        return Promise.all(paths.map(path => this.ensureDirectory(path)));
    }
    async streamWrite(path, data) {
        const stream = (0, node_fs_2.createWriteStream)(path);
        await (0, promises_1.pipeline)(node_stream_1.Readable.from(data), stream);
    }
    async streamRead(path) {
        return (0, node_fs_2.createReadStream)(path);
    }
    async copyFile(source, destination) {
        const start = Date.now();
        return this.writeQueue.add(async () => {
            try {
                await this.ensureDirectory((0, node_path_1.dirname)(destination));
                await node_fs_1.promises.copyFile(source, destination);
                const stats = await node_fs_1.promises.stat(destination);
                this.trackOperation('write', stats.size);
                return {
                    path: destination,
                    operation: 'write',
                    success: true,
                    duration: Date.now() - start,
                    size: stats.size
                };
            }
            catch (error) {
                this.metrics.errors++;
                this.logger.error('Failed to copy file', { source, destination, error });
                return {
                    path: destination,
                    operation: 'write',
                    success: false,
                    duration: Date.now() - start,
                    error: error
                };
            }
        });
    }
    async moveFile(source, destination) {
        const copyResult = await this.copyFile(source, destination);
        if (copyResult.success) {
            await this.deleteFile(source);
        }
        return copyResult;
    }
    trackOperation(type, bytes) {
        const count = this.metrics.operations.get(type) || 0;
        this.metrics.operations.set(type, count + 1);
        this.metrics.totalBytes += bytes;
    }
    getMetrics() {
        return {
            operations: Object.fromEntries(this.metrics.operations),
            totalBytes: this.metrics.totalBytes,
            errors: this.metrics.errors,
            writeQueueSize: this.writeQueue.size,
            readQueueSize: this.readQueue.size,
            writeQueuePending: this.writeQueue.pending,
            readQueuePending: this.readQueue.pending
        };
    }
    async waitForPendingOperations() {
        await Promise.all([
            this.writeQueue.onIdle(),
            this.readQueue.onIdle()
        ]);
    }
    clearQueues() {
        this.writeQueue.clear();
        this.readQueue.clear();
    }
}
exports.AsyncFileManager = AsyncFileManager;
