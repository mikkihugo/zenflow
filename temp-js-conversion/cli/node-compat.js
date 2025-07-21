"use strict";
/**
 * Node.js compatibility layer for Deno APIs
 * This module provides Node.js equivalents for Deno-specific APIs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deno = exports.Command = exports.env = exports.build = exports.existsSync = exports.isMainModule = exports.getFilename = exports.getDirname = exports.getImportMetaUrl = exports.errors = exports.stderr = exports.stdout = exports.stdin = exports.execPath = exports.exit = exports.kill = exports.pid = exports.mkdirAsync = exports.mkdirSync = exports.remove = exports.writeTextFile = exports.readTextFile = exports.statFile = exports.readDir = exports.cwd = exports.args = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
Object.defineProperty(exports, "existsSync", { enumerable: true, get: function () { return fs_1.existsSync; } });
const url_1 = require("url");
const path_1 = require("path");
const process_1 = require("process");
const child_process_1 = require("child_process");
// Process arguments (remove first two: node executable and script path)
exports.args = process_1.default.argv.slice(2);
// Current working directory
const cwd = () => process_1.default.cwd();
exports.cwd = cwd;
// File system operations
const readDir = async (path) => {
    const entries = await (0, promises_1.readdir)(path, { withFileTypes: true });
    return entries.map(entry => ({
        name: entry.name,
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory(),
        isSymlink: entry.isSymbolicLink()
    }));
};
exports.readDir = readDir;
const statFile = async (path) => {
    const stats = await (0, promises_1.stat)(path);
    return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
        atime: stats.atime,
        birthtime: stats.birthtime
    };
};
exports.statFile = statFile;
const readTextFile = async (path) => {
    return await (0, promises_1.readFile)(path, 'utf-8');
};
exports.readTextFile = readTextFile;
const writeTextFile = async (path, content) => {
    await (0, promises_1.writeFile)(path, content, 'utf-8');
};
exports.writeTextFile = writeTextFile;
const remove = async (path) => {
    const stats = await (0, promises_1.stat)(path);
    if (stats.isDirectory()) {
        await (0, promises_1.rmdir)(path, { recursive: true });
    }
    else {
        await (0, promises_1.unlink)(path);
    }
};
exports.remove = remove;
const mkdirSync = (path, options = {}) => {
    const fs = require('fs');
    fs.mkdirSync(path, { recursive: options.recursive });
};
exports.mkdirSync = mkdirSync;
const mkdirAsync = async (path, options = {}) => {
    await (0, promises_1.mkdir)(path, { recursive: options.recursive });
};
exports.mkdirAsync = mkdirAsync;
// Process operations
exports.pid = process_1.default.pid;
const kill = (pid, signal = 'SIGTERM') => {
    process_1.default.kill(pid, signal);
};
exports.kill = kill;
const exit = (code = 0) => {
    process_1.default.exit(code);
};
exports.exit = exit;
const execPath = () => process_1.default.execPath;
exports.execPath = execPath;
// stdin/stdout/stderr support
exports.stdin = {
    read: async (buffer) => {
        return new Promise((resolve) => {
            if (process_1.default.stdin.isTTY) {
                process_1.default.stdin.setRawMode(true);
            }
            process_1.default.stdin.resume();
            process_1.default.stdin.once('data', (data) => {
                const bytes = Math.min(data.length, buffer.length);
                for (let i = 0; i < bytes; i++) {
                    buffer[i] = data[i];
                }
                if (process_1.default.stdin.isTTY) {
                    process_1.default.stdin.setRawMode(false);
                }
                process_1.default.stdin.pause();
                resolve(bytes);
            });
        });
    }
};
exports.stdout = {
    write: async (data) => {
        return new Promise((resolve, reject) => {
            process_1.default.stdout.write(data, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(data.length);
            });
        });
    }
};
exports.stderr = {
    write: async (data) => {
        return new Promise((resolve, reject) => {
            process_1.default.stderr.write(data, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(data.length);
            });
        });
    }
};
// Deno.errors compatibility
exports.errors = {
    NotFound: class NotFound extends Error {
        constructor(message) {
            super(message);
            this.name = 'NotFound';
        }
    },
    AlreadyExists: class AlreadyExists extends Error {
        constructor(message) {
            super(message);
            this.name = 'AlreadyExists';
        }
    },
    PermissionDenied: class PermissionDenied extends Error {
        constructor(message) {
            super(message);
            this.name = 'PermissionDenied';
        }
    }
};
// import.meta compatibility
const getImportMetaUrl = () => {
    // This will be replaced by the actual import.meta.url in each file
    return import.meta.url;
};
exports.getImportMetaUrl = getImportMetaUrl;
const getDirname = (importMetaUrl) => {
    const __filename = (0, url_1.fileURLToPath)(importMetaUrl);
    return (0, path_1.dirname)(__filename);
};
exports.getDirname = getDirname;
const getFilename = (importMetaUrl) => {
    return (0, url_1.fileURLToPath)(importMetaUrl);
};
exports.getFilename = getFilename;
// Check if this is the main module (Node.js equivalent of import.meta.main)
const isMainModule = (importMetaUrl) => {
    const __filename = (0, url_1.fileURLToPath)(importMetaUrl);
    return process_1.default.argv[1] === __filename;
};
exports.isMainModule = isMainModule;
// Build information (Node.js equivalent of Deno.build)
exports.build = {
    os: process_1.default.platform === 'win32' ? 'windows' :
        process_1.default.platform === 'darwin' ? 'darwin' :
            process_1.default.platform === 'linux' ? 'linux' : process_1.default.platform,
    arch: process_1.default.arch,
    target: `${process_1.default.arch}-${process_1.default.platform}`
};
// Environment variables support
exports.env = {
    get: (key) => process_1.default.env[key],
    set: (key, value) => { process_1.default.env[key] = value; },
    toObject: () => ({ ...process_1.default.env })
};
// Deno.Command compatibility
class Command {
    constructor(command, options = {}) {
        this.command = command;
        this.options = options;
    }
    async output() {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(this.command, this.options.args || [], {
                cwd: this.options.cwd,
                env: this.options.env,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = [];
            let stderr = [];
            child.stdout.on('data', (data) => {
                stdout.push(data);
            });
            child.stderr.on('data', (data) => {
                stderr.push(data);
            });
            child.on('close', (code) => {
                resolve({
                    code,
                    success: code === 0,
                    stdout: Buffer.concat(stdout),
                    stderr: Buffer.concat(stderr)
                });
            });
            child.on('error', (err) => {
                reject(err);
            });
        });
    }
    spawn() {
        const child = (0, child_process_1.spawn)(this.command, this.options.args || [], {
            cwd: this.options.cwd,
            env: this.options.env,
            stdio: this.options.stdio || 'inherit'
        });
        return {
            status: new Promise((resolve) => {
                child.on('close', (code) => {
                    resolve({ code, success: code === 0 });
                });
            }),
            stdout: child.stdout,
            stderr: child.stderr,
            kill: (signal) => child.kill(signal)
        };
    }
}
exports.Command = Command;
// Export a Deno-like object for easier migration
exports.Deno = {
    args: exports.args,
    cwd: exports.cwd,
    readDir: exports.readDir,
    stat: exports.statFile,
    readTextFile: exports.readTextFile,
    writeTextFile: exports.writeTextFile,
    remove: exports.remove,
    mkdir: exports.mkdirAsync,
    pid: exports.pid,
    kill: exports.kill,
    exit: exports.exit,
    execPath: exports.execPath,
    errors: exports.errors,
    build: exports.build,
    stdin: exports.stdin,
    stdout: exports.stdout,
    stderr: exports.stderr,
    env: exports.env,
    Command
};
exports.default = exports.Deno;
