"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedPromptCopier = void 0;
exports.copyPromptsEnhanced = copyPromptsEnhanced;
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const __dirname = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
const fs = require("fs/promises");
const path = require("path");
const worker_threads_1 = require("worker_threads");
const prompt_copier_js_1 = require("./prompt-copier.js");
const logger_js_1 = require("../core/logger.js");
class EnhancedPromptCopier extends prompt_copier_js_1.PromptCopier {
    constructor(options) {
        super(options);
        this.workerResults = new Map();
    }
    async copyFilesParallel() {
        const workerCount = Math.min(this.options.maxWorkers, this.fileQueue.length);
        // Initialize worker pool
        this.workerPool = await this.initializeWorkerPool(workerCount);
        try {
            // Process files using worker pool
            await this.processWithWorkerPool();
        }
        finally {
            // Cleanup workers
            await this.terminateWorkers();
        }
    }
    async initializeWorkerPool(workerCount) {
        const workers = [];
        const pool = {
            workers,
            busy: new Set(),
            queue: []
        };
        // Create workers
        for (let i = 0; i < workerCount; i++) {
            const worker = new worker_threads_1.Worker(path.join(__dirname, 'workers', 'copy-worker.js'), {
                workerData: { workerId: i }
            });
            // Setup worker message handler
            worker.on('message', (result) => {
                this.handleWorkerResult(result, i, pool);
            });
            worker.on('error', (error) => {
                logger_js_1.logger.error(`Worker ${i} error:`, error);
                this.errors.push({
                    file: 'worker',
                    error: (error instanceof Error ? error.message : String(error)),
                    phase: 'write'
                });
            });
            workers.push(worker);
        }
        return pool;
    }
    async processWithWorkerPool() {
        const chunkSize = Math.max(1, Math.floor(this.fileQueue.length / this.workerPool.workers.length / 2));
        const chunks = [];
        // Create chunks for better distribution
        for (let i = 0; i < this.fileQueue.length; i += chunkSize) {
            chunks.push(this.fileQueue.slice(i, i + chunkSize));
        }
        // Process chunks
        const promises = [];
        for (const chunk of chunks) {
            promises.push(this.processChunkWithWorker(chunk));
        }
        await Promise.all(promises);
    }
    async processChunkWithWorker(chunk) {
        return new Promise((resolve, reject) => {
            const pool = this.workerPool;
            const tryAssignWork = () => {
                // Find available worker
                const availableWorkerIndex = pool.workers.findIndex((_, index) => !pool.busy.has(index));
                if (availableWorkerIndex === -1) {
                    // No workers available, queue the work
                    pool.queue.push(tryAssignWork);
                    return;
                }
                // Mark worker as busy
                pool.busy.add(availableWorkerIndex);
                // Prepare worker data
                const workerData = {
                    files: chunk.map(file => ({
                        sourcePath: file.path,
                        destPath: path.join(this.options.destination, file.relativePath),
                        permissions: this.options.preservePermissions ? file.permissions : undefined,
                        verify: this.options.verify
                    })),
                    workerId: availableWorkerIndex
                };
                let remainingFiles = chunk.length;
                const chunkResults = [];
                // Setup temporary message handler for this chunk
                const messageHandler = (result) => {
                    chunkResults.push(result);
                    remainingFiles--;
                    if (remainingFiles === 0) {
                        // Chunk complete
                        pool.workers[availableWorkerIndex].off('message', messageHandler);
                        pool.busy.delete(availableWorkerIndex);
                        // Process next queued work
                        if (pool.queue.length > 0) {
                            const nextWork = pool.queue.shift();
                            nextWork();
                        }
                        // Process results
                        this.processChunkResults(chunk, chunkResults);
                        resolve();
                    }
                };
                pool.workers[availableWorkerIndex].on('message', messageHandler);
                pool.workers[availableWorkerIndex].postMessage(workerData);
            };
            tryAssignWork();
        });
    }
    processChunkResults(chunk, results) {
        for (const result of results) {
            if (result.success) {
                this.copiedFiles.add(result.file);
                if (result.hash) {
                    this.workerResults.set(result.file, { hash: result.hash });
                }
            }
            else {
                this.errors.push({
                    file: result.file,
                    error: result.error,
                    phase: 'write'
                });
            }
        }
        // Report progress through the callback if available
        if (this.options.progressCallback) {
            this.options.progressCallback(this.copiedFiles.size, this.totalFiles);
        }
    }
    handleWorkerResult(result, workerId, pool) {
        // This is a fallback handler, actual handling happens in processChunkWithWorker
        logger_js_1.logger.debug(`Worker ${workerId} result:`, result);
    }
    async terminateWorkers() {
        if (!this.workerPool)
            return;
        const terminationPromises = this.workerPool.workers.map(worker => worker.terminate());
        await Promise.all(terminationPromises);
        this.workerPool = undefined;
    }
    // Override verification to use worker results
    async verifyFiles() {
        logger_js_1.logger.info('Verifying copied files...');
        for (const file of this.fileQueue) {
            if (!this.copiedFiles.has(file.path))
                continue;
            try {
                const destPath = path.join(this.options.destination, file.relativePath);
                // Verify file exists
                if (!await this.fileExists(destPath)) {
                    throw new Error('Destination file not found');
                }
                // Verify size
                const destStats = await fs.stat(destPath);
                const sourceStats = await fs.stat(file.path);
                if (destStats.size !== sourceStats.size) {
                    throw new Error(`Size mismatch: ${destStats.size} != ${sourceStats.size}`);
                }
                // Use hash from worker if available
                const workerResult = this.workerResults.get(file.path);
                if (workerResult?.hash) {
                    const sourceHash = await this.calculateFileHash(file.path);
                    if (sourceHash !== workerResult.hash) {
                        throw new Error(`Hash mismatch: ${sourceHash} != ${workerResult.hash}`);
                    }
                }
            }
            catch (error) {
                this.errors.push({
                    file: file.path,
                    error: (error instanceof Error ? error.message : String(error)),
                    phase: 'verify'
                });
            }
        }
    }
}
exports.EnhancedPromptCopier = EnhancedPromptCopier;
// Export enhanced copy function
async function copyPromptsEnhanced(options) {
    const copier = new EnhancedPromptCopier(options);
    return copier.copy();
}
