/**
 * File system utilities with consistent error handling
 * Implements Google's single responsibility principle
 * Provides type-safe file system operations with comprehensive error handling
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CliError } from './cli-error.js';
import logger from './logger.js';

/**
 * Directory listing options
 */
export interface DirectoryListingOptions {
  filesOnly?: boolean;
  directoriesOnly?: boolean;
  pattern?: string;
  recursive?: boolean;
}

/**
 * File stats interface
 */
export interface FileStats {size = BufferEncoding | 'binary'

/**
 * Ensure directory exists, creating it if necessary
 * @param dirPath - Directory path to ensure
 * @returns Promise resolving to true if successful
 */
export async function ensureDirectoryExists(dirPath = 'utf8'): Promise<string | Buffer> {
  try {
    const content = await fs.readFile(filePath
, encoding)
const _size = typeof content === 'string' ? content.length = encoding === 'utf8' ? 'characters' : 'bytes';
logger.debug(`Fileread = 'utf8'
): Promise<boolean> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await ensureDirectoryExists(dir);
    
    await fs.writeFile(filePath, content, encoding);
    const size = typeof content === 'string' ? content.length = encoding === 'utf8' ? 'characters' : 'bytes';
    logger.debug(`Filewritten = path.dirname(destinationPath);
await ensureDirectoryExists(destDir);

await fs.copyFile(sourcePath, destinationPath);
logger.debug(`File copied = {}
): Promise<DirectoryEntry[]> {
  try {
    const entries = await fs.readdir(dirPath, {withFileTypes = entries;
    
    // Filter by type
    if (options.filesOnly) {
      filteredEntries = filteredEntries.filter(entry => entry.isFile());
    }
    if (options.directoriesOnly) {
      filteredEntries = filteredEntries.filter(entry => entry.isDirectory());
    }
    
    // Filter by pattern
    if (options.pattern) {
      const regex = new RegExp(options.pattern);
      filteredEntries = filteredEntries.filter(entry => regex.test(entry.name));
    }

    return {
      size = {}): Promise<boolean> {
  try {
    const stats = await fs.stat(targetPath);
    
    if (stats.isDirectory()) {
      await fs.rmdir(targetPath, {recursive = == 'ENOENT' && options.ignoreNotFound) {
      logger.debug(`Path not found (ignored): ${targetPath}`);
return true;
}
throw new CliError(`Failed to remove '${targetPath}': ${error.message}`);
}
}

/**
 * Move/rename file or directory
 * @param sourcePath - Source path
 * @param destinationPath - Destination path
 * @returns Promise resolving to true if successful
 */
export async function movePathSecurely(sourcePath = path.dirname(destinationPath);
await ensureDirectoryExists(destDir);

await fs.rename(sourcePath, destinationPath);
logger.debug(`Pathmoved = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 * @param dirPath - Path to check
 * @returns Promise resolving to true if path is a directory
 */
export async function isDirectory(dirPath = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 * @param filePath - File path
 * @returns Promise resolving to file size in bytes
 */
export async function getFileSize(filePath = await fs.stat(filePath);
    return stats.size;
  } catch (error = any>(filePath): Promise<T> {
  try {
    const content = await readFileSecurely(filePath, 'utf8') as string;
    return JSON.parse(content) as T;
  } catch (error = true): Promise<boolean> {
  try {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    return await writeFileSecurely(filePath, content, 'utf8');
  } catch (error = 'temp', extension = '.tmp'): Promise<string> {
  const tmpDir = process.env.TMPDIR || process.env.TMP || '/tmp';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const tempPath = path.join(tmpDir, `${prefix}-${timestamp}-${random}${extension}`);
  
  // Create empty file
  await writeFileSecurely(tempPath, '', 'utf8');
  logger.debug(`Temporary filecreated = 'temp')
: Promise<string>
{
  const tmpDir = process.env.TMPDIR || process.env.TMP || '/tmp';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const tempPath = path.join(tmpDir, `${prefix}-${timestamp}-${random}`);

  await ensureDirectoryExists(tempPath);
  logger.debug(`Temporary directory created: ${tempPath}`);

  return tempPath;
}
