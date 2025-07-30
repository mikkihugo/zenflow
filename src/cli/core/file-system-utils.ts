/**
 * File system utilities with consistent error handling;
 * Implements Google's single responsibility principle;
 * Provides type-safe file system operations with comprehensive error handling;
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CliError } from './cli-error.js';
import logger from './logger.js';
/**
 * Directory listing options;
 */
export interface DirectoryListingOptions {
  filesOnly?: boolean;
  directoriesOnly?: boolean;
  pattern?: string;
  recursive?: boolean;
// }
/**
 * File stats interface;
 */
export interface FileStats {size = BufferEncoding | 'binary'
/**
 * Ensure directory exists, creating it if necessary;
 * @param dirPath - Directory path to ensure;
 * @returns Promise resolving to true if successful;
    // */ // LINT: unreachable code removed
export async function ensureDirectoryExists(dirPath = 'utf8'): Promise<string | Buffer> {
  try {
// const _content = awaitfs.readFile(filePath
, encoding)
const __size = typeof content === 'string' ? content.length = encoding === 'utf8' ? 'characters' : 'bytes';
logger.debug(`Fileread = 'utf8';
): Promise<boolean> {
  try {
    // Ensure directory exists
    const _dir = path.dirname(filePath);
// await ensureDirectoryExists(dir);// await fs.writeFile(filePath, content, encoding);
    const _size = typeof content === 'string' ? content.length = encoding === 'utf8' ? 'characters' : 'bytes';
    logger.debug(`Filewritten = path.dirname(destinationPath);
// await ensureDirectoryExists(destDir);
// await fs.copyFile(sourcePath, destinationPath);
logger.debug(`File copied = {}
): Promise<DirectoryEntry[]> {
  try {
// const _entries = awaitfs.readdir(dirPath, {withFileTypes = entries;

    // Filter by type
    if (options.filesOnly) {
      filteredEntries = filteredEntries.filter(entry => entry.isFile());
    //     }
    if (options.directoriesOnly) {
      filteredEntries = filteredEntries.filter(entry => entry.isDirectory());
    //     }


    // Filter by pattern
    if (options.pattern) {
      const _regex = new RegExp(options.pattern);
      filteredEntries = filteredEntries.filter(entry => regex.test(entry.name));
    //     }


    return {
      size = {}): Promise<boolean> {
  try {
// const _stats = awaitfs.stat(targetPath);
    // ; // LINT: unreachable code removed
    if (stats.isDirectory()) {
// await fs.rmdir(targetPath, {recursive = === 'ENOENT' && options.ignoreNotFound) {
      logger.debug(`Path not found (ignored): ${targetPath}`);
return true;
// }
throw new CliError(`Failed to remove '${targetPath}');
// }
// }
/**
 * Move/rename file or directory;
 * @param sourcePath - Source path;
 * @param destinationPath - Destination path;
 * @returns Promise resolving to true if successful;
    // */ // LINT: unreachable code removed
export async function movePathSecurely(sourcePath = path.dirname(destinationPath);
// await ensureDirectoryExists(destDir);
// await fs.rename(sourcePath, destinationPath);
logger.debug(`Pathmoved = await fs.stat(filePath);
    return stats.isFile();
    //   // LINT: unreachable code removed} catch {
    return false;
    //   // LINT: unreachable code removed}
// }


/**
 * Check if path is a directory;
 * @param dirPath - Path to check;
 * @returns Promise resolving to true if path is a directory;
    // */; // LINT: unreachable code removed
export async function isDirectory(dirPath = await fs.stat(dirPath);
    return stats.isDirectory();
    //   // LINT: unreachable code removed} catch {
    return false;
    //   // LINT: unreachable code removed}
// }


/**
 * Get file size in bytes;
 * @param filePath - File path;
 * @returns Promise resolving to file size in bytes;
    // */; // LINT: unreachable code removed
export async function getFileSize(filePath = await fs.stat(filePath);
    return stats.size;
    //   // LINT: unreachable code removed} catch (error = any>(filePath): Promise<T> {
  try {
// const _content = awaitreadFileSecurely(filePath, 'utf8') as string;
    return JSON.parse(content) as T;
    //   // LINT: unreachable code removed} catch (error = true): Promise<boolean> {
  try {
    const _content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    return await writeFileSecurely(filePath, content, 'utf8');
    //   // LINT: unreachable code removed} catch (error = 'temp', extension = '.tmp'): Promise<string> {
  const _tmpDir = process.env.TMPDIR  ?? process.env.TMP  ?? '/tmp';
  const _timestamp = Date.now();
  const _random = Math.random().toString(36).substring(2);
  const _tempPath = path.join(tmpDir, `${prefix}-${timestamp}-${random}${extension}`);

  // Create empty file
// await writeFileSecurely(tempPath, '', 'utf8');
  logger.debug(`Temporary filecreated = 'temp');
: Promise<string>
// {
  const _tmpDir = process.env.TMPDIR ?? process.env.TMP ?? '/tmp';
  const _timestamp = Date.now();
  const _random = Math.random().toString(36).substring(2);
  const _tempPath = path.join(tmpDir, `${prefix}-${timestamp}-${random}`);
// await ensureDirectoryExists(tempPath);
  logger.debug(`Temporary directory created);
  return tempPath;
// }

