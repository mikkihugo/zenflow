/**
 * File system utilities with consistent error handling
 * Implements Google's single responsibility principle
 */

import { promises as fs } from 'fs';
import path from 'path';
import { CliError } from './cli-error.js';
import logger from './logger.js';

/**
 * Ensure directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug(`Directory ensured: ${dirPath}`);
    return true;
  } catch (error) {
    throw new CliError(`Failed to create directory '${dirPath}': ${error.message}`);
  }
}

/**
 * Check if file or directory exists
 */
export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file with proper error handling
 */
export async function readFileSecurely(filePath, encoding = 'utf8') {
  try {
    const content = await fs.readFile(filePath, encoding);
    logger.debug(`File read: ${filePath} (${content.length} ${encoding === 'utf8' ? 'characters' : 'bytes'})`);
    return content;
  } catch (error) {
    throw new CliError(`Failed to read file '${filePath}': ${error.message}`);
  }
}

/**
 * Write file with proper error handling
 */
export async function writeFileSecurely(filePath, content, encoding = 'utf8') {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await ensureDirectoryExists(dir);
    
    await fs.writeFile(filePath, content, encoding);
    logger.debug(`File written: ${filePath} (${content.length} ${encoding === 'utf8' ? 'characters' : 'bytes'})`);
    return true;
  } catch (error) {
    throw new CliError(`Failed to write file '${filePath}': ${error.message}`);
  }
}

/**
 * Copy file with proper error handling
 */
export async function copyFileSecurely(sourcePath, destinationPath) {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    await ensureDirectoryExists(destDir);
    
    await fs.copyFile(sourcePath, destinationPath);
    logger.debug(`File copied: ${sourcePath} → ${destinationPath}`);
    return true;
  } catch (error) {
    throw new CliError(`Failed to copy file '${sourcePath}' to '${destinationPath}': ${error.message}`);
  }
}

/**
 * List directory contents with filtering
 */
export async function listDirectoryContents(dirPath, options = {}) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    let filteredEntries = entries;
    
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
    
    const result = filteredEntries.map(entry => ({
      name: entry.name,
      path: path.join(dirPath, entry.name),
      isFile: entry.isFile(),
      isDirectory: entry.isDirectory()
    }));
    
    logger.debug(`Directory listed: ${dirPath} (${result.length} entries)`);
    return result;
  } catch (error) {
    throw new CliError(`Failed to list directory '${dirPath}': ${error.message}`);
  }
}

/**
 * Get file stats with proper error handling
 */
export async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      permissions: stats.mode
    };
  } catch (error) {
    throw new CliError(`Failed to get stats for '${filePath}': ${error.message}`);
  }
}

/**
 * Remove file or directory safely
 */
export async function removePathSafely(targetPath, options = {}) {
  try {
    const stats = await fs.stat(targetPath);
    
    if (stats.isDirectory()) {
      await fs.rmdir(targetPath, { recursive: options.recursive || false });
      logger.debug(`Directory removed: ${targetPath}`);
    } else {
      await fs.unlink(targetPath);
      logger.debug(`File removed: ${targetPath}`);
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ENOENT' && options.ignoreNotFound) {
      logger.debug(`Path not found (ignored): ${targetPath}`);
      return true;
    }
    throw new CliError(`Failed to remove '${targetPath}': ${error.message}`);
  }
}