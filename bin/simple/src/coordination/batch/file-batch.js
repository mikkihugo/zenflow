import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('FileBatch');
export class FileBatchOperator {
    maxConcurrentFiles;
    defaultEncoding;
    constructor(maxConcurrentFiles = 10, defaultEncoding = 'utf8') {
        this.maxConcurrentFiles = maxConcurrentFiles;
        this.defaultEncoding = defaultEncoding;
    }
    async executeBatch(operations) {
        logger.info(`Starting batch file operations: ${operations.length} files`);
        const groupedOps = this.groupOperationsByType(operations);
        const results = [];
        if (groupedOps.mkdir.length > 0) {
            const mkdirResults = await this.executeConcurrentOperations(groupedOps.mkdir, this.executeMkdir.bind(this));
            results.push(...mkdirResults);
        }
        const mainOperations = [
            ...groupedOps.read,
            ...groupedOps.write,
            ...groupedOps.create,
            ...groupedOps.copy,
            ...groupedOps.move,
        ];
        if (mainOperations.length > 0) {
            const mainResults = await this.executeConcurrentOperations(mainOperations, this.executeFileOperation.bind(this));
            results.push(...mainResults);
        }
        const cleanupOperations = [...groupedOps.delete, ...groupedOps.rmdir];
        if (cleanupOperations.length > 0) {
            const cleanupResults = await this.executeConcurrentOperations(cleanupOperations, this.executeFileOperation.bind(this));
            results.push(...cleanupResults);
        }
        logger.info(`Completed batch file operations: ${results.length} operations processed`);
        return results;
    }
    groupOperationsByType(operations) {
        const groups = {
            read: [],
            write: [],
            create: [],
            delete: [],
            copy: [],
            move: [],
            mkdir: [],
            rmdir: [],
        };
        for (const operation of operations) {
            groups[operation.type]?.push(operation);
        }
        return groups;
    }
    async executeConcurrentOperations(operations, executor) {
        const results = [];
        for (let i = 0; i < operations.length; i += this.maxConcurrentFiles) {
            const chunk = operations.slice(i, i + this.maxConcurrentFiles);
            const chunkPromises = chunk.map(executor);
            const chunkResults = await Promise.allSettled(chunkPromises);
            chunkResults?.forEach((result, index) => {
                if (result?.status === 'fulfilled') {
                    results.push(result?.value);
                }
                else {
                    const operation = chunk[index];
                    results.push({
                        operation,
                        success: false,
                        error: result?.reason?.message || 'Unknown error',
                        executionTime: 0,
                    });
                }
            });
        }
        return results;
    }
    async executeFileOperation(operation) {
        const startTime = Date.now();
        try {
            switch (operation.type) {
                case 'read':
                    return await this.executeRead(operation, startTime);
                case 'write':
                    return await this.executeWrite(operation, startTime);
                case 'create':
                    return await this.executeCreate(operation, startTime);
                case 'delete':
                    return await this.executeDelete(operation, startTime);
                case 'copy':
                    return await this.executeCopy(operation, startTime);
                case 'move':
                    return await this.executeMove(operation, startTime);
                case 'rmdir':
                    return await this.executeRmdir(operation, startTime);
                default:
                    throw new Error(`Unsupported operation type: ${operation.type}`);
            }
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                operation,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime,
            };
        }
    }
    async executeRead(operation, startTime) {
        const encoding = operation.encoding || this.defaultEncoding;
        const content = await fs.readFile(operation.path, encoding);
        const stats = await fs.stat(operation.path);
        return {
            operation,
            success: true,
            result: content,
            size: stats.size,
            executionTime: Date.now() - startTime,
        };
    }
    async executeWrite(operation, startTime) {
        if (!operation.content) {
            throw new Error('Write operation requires content');
        }
        await this.ensureDirectoryExists(dirname(operation.path));
        const encoding = operation.encoding || this.defaultEncoding;
        await fs.writeFile(operation.path, operation.content, encoding);
        const stats = await fs.stat(operation.path);
        return {
            operation,
            success: true,
            result: true,
            size: stats.size,
            executionTime: Date.now() - startTime,
        };
    }
    async executeCreate(operation, startTime) {
        if (!operation.content) {
            throw new Error('Create operation requires content');
        }
        await this.ensureDirectoryExists(dirname(operation.path));
        const encoding = operation.encoding || this.defaultEncoding;
        await fs.writeFile(operation.path, operation.content, {
            encoding,
            flag: 'wx',
        });
        const stats = await fs.stat(operation.path);
        return {
            operation,
            success: true,
            result: true,
            size: stats.size,
            executionTime: Date.now() - startTime,
        };
    }
    async executeDelete(operation, startTime) {
        await fs.unlink(operation.path);
        return {
            operation,
            success: true,
            result: true,
            executionTime: Date.now() - startTime,
        };
    }
    async executeCopy(operation, startTime) {
        if (!operation.destination) {
            throw new Error('Copy operation requires destination');
        }
        await this.ensureDirectoryExists(dirname(operation.destination));
        await fs.copyFile(operation.path, operation.destination);
        const stats = await fs.stat(operation.destination);
        return {
            operation,
            success: true,
            result: true,
            size: stats.size,
            executionTime: Date.now() - startTime,
        };
    }
    async executeMove(operation, startTime) {
        if (!operation.destination) {
            throw new Error('Move operation requires destination');
        }
        await this.ensureDirectoryExists(dirname(operation.destination));
        await fs.rename(operation.path, operation.destination);
        const stats = await fs.stat(operation.destination);
        return {
            operation,
            success: true,
            result: true,
            size: stats.size,
            executionTime: Date.now() - startTime,
        };
    }
    async executeMkdir(operation) {
        const startTime = Date.now();
        try {
            await fs.mkdir(operation.path, {
                recursive: true,
                mode: operation.mode || 0o755,
            });
            return {
                operation,
                success: true,
                result: true,
                executionTime: Date.now() - startTime,
            };
        }
        catch (error) {
            if (error.code === 'EEXIST') {
                return {
                    operation,
                    success: true,
                    result: true,
                    executionTime: Date.now() - startTime,
                };
            }
            throw error;
        }
    }
    async executeRmdir(operation, startTime) {
        await fs.rmdir(operation.path, { recursive: true });
        return {
            operation,
            success: true,
            result: true,
            executionTime: Date.now() - startTime,
        };
    }
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        }
        catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    static createBatchOperations(fileOps) {
        return fileOps.map((fileOp, index) => ({
            id: `file-${index}-${fileOp.type}-${Date.now()}`,
            type: 'file',
            operation: fileOp.type,
            params: {
                path: fileOp.path,
                content: fileOp.content,
                destination: fileOp.destination,
                encoding: fileOp.encoding,
                mode: fileOp.mode,
            },
        }));
    }
    static createWriteBatch(files) {
        return files.map((file) => {
            const operation = {
                type: 'write',
                path: file.path,
                content: file.content,
            };
            if (file.encoding !== undefined) {
                operation.encoding = file.encoding;
            }
            return operation;
        });
    }
    static createProjectStructure(basePath, structure) {
        const operations = [];
        const directories = new Set();
        for (const filePath of Object.keys(structure)) {
            const fullPath = join(basePath, filePath);
            let currentDir = dirname(fullPath);
            while (currentDir !== basePath && currentDir !== '.') {
                directories.add(currentDir);
                currentDir = dirname(currentDir);
            }
        }
        for (const dir of Array.from(directories).sort()) {
            operations.push({
                type: 'mkdir',
                path: dir,
            });
        }
        for (const [filePath, content] of Object.entries(structure)) {
            const fullPath = join(basePath, filePath);
            if (content !== null) {
                operations.push({
                    type: 'write',
                    path: fullPath,
                    content,
                });
            }
        }
        return operations;
    }
    static validateOperations(operations) {
        const errors = [];
        for (const [index, operation] of operations.entries()) {
            const prefix = `Operation ${index} (${operation.type}):`;
            if (!operation.path) {
                errors.push(`${prefix} Missing required path`);
                continue;
            }
            switch (operation.type) {
                case 'write':
                case 'create':
                    if (operation.content === undefined) {
                        errors.push(`${prefix} Missing required content`);
                    }
                    break;
                case 'copy':
                case 'move':
                    if (!operation.destination) {
                        errors.push(`${prefix} Missing required destination`);
                    }
                    break;
            }
        }
        return errors;
    }
}
//# sourceMappingURL=file-batch.js.map