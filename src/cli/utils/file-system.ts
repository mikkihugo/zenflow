/**
 * File System Utilities
 * 
 * Provides file and directory operations with proper error handling and TypeScript types.
 * All functions are async and return promises with proper error handling.
 */

import {
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  mkdir,
  stat,
  access,
  readdir,
  copyFile as fsCopyFile,
  rename,
  unlink,
  rm,
} from 'fs/promises';
import { constants, existsSync, statSync } from 'fs';
import { dirname, basename, extname, join, resolve, relative } from 'path';
import type { Stats } from 'fs';

/**
 * File statistics with additional helpers
 */
export interface FileStats extends Stats {
  /** File name */
  name: string;
  
  /** File extension */
  extension: string;
  
  /** File path */
  path: string;
  
  /** Is file readable */
  readable: boolean;
  
  /** Is file writable */
  writable: boolean;
  
  /** Is file executable */
  executable: boolean;
}

/**
 * Directory listing with file information
 */
export interface DirectoryListing {
  /** Directory path */
  path: string;
  
  /** Files in directory */
  files: FileStats[];
  
  /** Subdirectories */
  directories: FileStats[];
  
  /** Total number of items */
  totalItems: number;
  
  /** Total size of all files */
  totalSize: number;
}

/**
 * File operation options
 */
export interface FileOptions {
  /** File encoding (default: 'utf8') */
  encoding?: BufferEncoding;
  
  /** File mode/permissions */
  mode?: number;
  
  /** Create parent directories if they don't exist */
  recursive?: boolean;
  
  /** Overwrite existing files */
  overwrite?: boolean;
}

/**
 * Read a file as string
 */
export async function readFile(
  filePath: string,
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  try {
    return await fsReadFile(filePath, encoding);
  } catch (error) {
    throw new Error(`Failed to read file "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * Write content to a file
 */
export async function writeFile(
  filePath: string,
  content: string,
  options: FileOptions = {}
): Promise<void> {
  try {
    // Ensure parent directory exists if recursive option is set
    if (options.recursive) {
      await ensureDirectory(dirname(filePath));
    }
    
    // Check if file exists and overwrite is not allowed
    if (!options.overwrite && await fileExists(filePath)) {
      throw new Error(`File "${filePath}" already exists and overwrite is disabled`);
    }
    
    await fsWriteFile(filePath, content, {
      encoding: options.encoding || 'utf8',
      mode: options.mode,
    });
  } catch (error) {
    throw new Error(`Failed to write file "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Create a directory
 */
export async function createDirectory(
  dirPath: string,
  options: { recursive?: boolean; mode?: number } = {}
): Promise<void> {
  try {
    await mkdir(dirPath, {
      recursive: options.recursive || false,
      mode: options.mode,
    });
  } catch (error) {
    throw new Error(`Failed to create directory "${dirPath}": ${(error as Error).message}`);
  }
}

/**
 * Ensure directory exists (create if it doesn't)
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  if (!(await directoryExists(dirPath))) {
    await createDirectory(dirPath, { recursive: true });
  }
}

/**
 * Copy a file
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string,
  options: FileOptions = {}
): Promise<void> {
  try {
    // Ensure destination directory exists if recursive option is set
    if (options.recursive) {
      await ensureDirectory(dirname(destinationPath));
    }
    
    // Check if destination exists and overwrite is not allowed
    if (!options.overwrite && await fileExists(destinationPath)) {
      throw new Error(`Destination file "${destinationPath}" already exists and overwrite is disabled`);
    }
    
    await fsCopyFile(sourcePath, destinationPath);
  } catch (error) {
    throw new Error(`Failed to copy file from "${sourcePath}" to "${destinationPath}": ${(error as Error).message}`);
  }
}

/**
 * Move/rename a file
 */
export async function moveFile(
  sourcePath: string,
  destinationPath: string,
  options: FileOptions = {}
): Promise<void> {
  try {
    // Ensure destination directory exists if recursive option is set
    if (options.recursive) {
      await ensureDirectory(dirname(destinationPath));
    }
    
    // Check if destination exists and overwrite is not allowed
    if (!options.overwrite && await fileExists(destinationPath)) {
      throw new Error(`Destination file "${destinationPath}" already exists and overwrite is disabled`);
    }
    
    await rename(sourcePath, destinationPath);
  } catch (error) {
    throw new Error(`Failed to move file from "${sourcePath}" to "${destinationPath}": ${(error as Error).message}`);
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * Delete a directory (must be empty unless recursive)
 */
export async function deleteDirectory(
  dirPath: string,
  options: { recursive?: boolean } = {}
): Promise<void> {
  try {
    if (options.recursive) {
      // For recursive deletion, we need to use a more complex approach
      const { rm } = await import('fs/promises');
      await rm(dirPath, { recursive: true, force: true });
    } else {
      await rm(dirPath, { recursive: true });
    }
  } catch (error) {
    throw new Error(`Failed to delete directory "${dirPath}": ${(error as Error).message}`);
  }
}

/**
 * Get file statistics
 */
export async function getFileStats(filePath: string): Promise<FileStats> {
  try {
    const stats = await stat(filePath);
    const name = basename(filePath);
    const extension = extname(filePath);
    
    // Check permissions
    let readable = false;
    let writable = false;
    let executable = false;
    
    try {
      await access(filePath, constants.R_OK);
      readable = true;
    } catch {}
    
    try {
      await access(filePath, constants.W_OK);
      writable = true;
    } catch {}
    
    try {
      await access(filePath, constants.X_OK);
      executable = true;
    } catch {}
    
    return {
      ...stats,
      name,
      extension,
      path: filePath,
      readable,
      writable,
      executable,
    };
  } catch (error) {
    throw new Error(`Failed to get file stats for "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * List files in a directory
 */
export async function listFiles(
  dirPath: string,
  options: { recursive?: boolean; includeStats?: boolean } = {}
): Promise<string[] | FileStats[]> {
  try {
    const entries = await readdir(dirPath);
    const files: string[] = [];
    const fileStats: FileStats[] = [];
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isFile()) {
        files.push(options.recursive ? fullPath : entry);
        
        if (options.includeStats) {
          fileStats.push(await getFileStats(fullPath));
        }
      } else if (stats.isDirectory() && options.recursive) {
        const subFiles = await listFiles(fullPath, options) as string[];
        files.push(...subFiles);
      }
    }
    
    return options.includeStats ? fileStats : files;
  } catch (error) {
    throw new Error(`Failed to list files in "${dirPath}": ${(error as Error).message}`);
  }
}

/**
 * List directories in a directory
 */
export async function listDirectories(
  dirPath: string,
  options: { recursive?: boolean; includeStats?: boolean } = {}
): Promise<string[] | FileStats[]> {
  try {
    const entries = await readdir(dirPath);
    const directories: string[] = [];
    const dirStats: FileStats[] = [];
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        directories.push(options.recursive ? fullPath : entry);
        
        if (options.includeStats) {
          dirStats.push(await getFileStats(fullPath));
        }
        
        if (options.recursive) {
          const subDirs = await listDirectories(fullPath, options) as string[];
          directories.push(...subDirs);
        }
      }
    }
    
    return options.includeStats ? dirStats : directories;
  } catch (error) {
    throw new Error(`Failed to list directories in "${dirPath}": ${(error as Error).message}`);
  }
}

/**
 * Get complete directory listing
 */
export async function getDirectoryListing(dirPath: string): Promise<DirectoryListing> {
  try {
    const entries = await readdir(dirPath);
    const files: FileStats[] = [];
    const directories: FileStats[] = [];
    let totalSize = 0;
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const fileStats = await getFileStats(fullPath);
      
      if (fileStats.isFile()) {
        files.push(fileStats);
        totalSize += fileStats.size;
      } else if (fileStats.isDirectory()) {
        directories.push(fileStats);
      }
    }
    
    return {
      path: dirPath,
      files,
      directories,
      totalItems: files.length + directories.length,
      totalSize,
    };
  } catch (error) {
    throw new Error(`Failed to get directory listing for "${dirPath}": ${(error as Error).message}`);
  }
}

/**
 * Check if path is a file
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return extname(filePath);
}

/**
 * Get file name (without directory)
 */
export function getFileName(filePath: string): string {
  return basename(filePath);
}

/**
 * Get directory name
 */
export function getDirectoryName(filePath: string): string {
  return dirname(filePath);
}

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  return join(...segments);
}

/**
 * Resolve path to absolute path
 */
export function resolvePath(...paths: string[]): string {
  return resolve(...paths);
}

/**
 * Get relative path between two paths
 */
export function relativePath(from: string, to: string): string {
  return relative(from, to);
}

/**
 * Synchronous file existence check (for performance-critical operations)
 */
export function fileExistsSync(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Synchronous directory existence check (for performance-critical operations)
 */
export function directoryExistsSync(dirPath: string): boolean {
  try {
    const stats = statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Find files matching a pattern
 */
export async function findFiles(
  dirPath: string,
  pattern: RegExp | string,
  options: { recursive?: boolean; caseSensitive?: boolean } = {}
): Promise<string[]> {
  const matchedFiles: string[] = [];
  const regex = typeof pattern === 'string' 
    ? new RegExp(pattern, options.caseSensitive ? 'g' : 'gi')
    : pattern;
  
  const files = await listFiles(dirPath, { recursive: options.recursive }) as string[];
  
  for (const file of files) {
    const fileName = basename(file);
    if (regex.test(fileName)) {
      matchedFiles.push(file);
    }
  }
  
  return matchedFiles;
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await stat(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Failed to get file size for "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * Check if file is readable
 */
export async function isReadable(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if file is writable
 */
export async function isWritable(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Watch file or directory for changes
 */
export function watchPath(
  path: string,
  callback: (eventType: string, filename: string | null) => void
): () => void {
  const { watch } = require('fs');
  const watcher = watch(path, callback);
  
  return () => {
    watcher.close();
  };
}
