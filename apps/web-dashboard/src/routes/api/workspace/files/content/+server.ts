/**
 * @fileoverview Workspace File Content API - Provides file content access
 */

import { json } from '@sveltejs/kit';
import { readFile, stat } from 'fs/promises';
import { resolve, join } from 'path';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
      return json({ error: 'Path parameter is required' }, { status: 400 });
    }
    
    // Base directory - use current working directory for now
    const baseDir = process.cwd();
    const targetPath = join(baseDir, path);
    
    // Resolve the path to prevent directory traversal attacks
    const resolvedPath = resolve(targetPath);
    
    // Basic security check - ensure we're within the base directory
    if (!resolvedPath.startsWith(resolve(baseDir))) {
      return json({ error: 'Access denied' }, { status: 403 });
    }
    
    try {
      // Check if file exists and is readable
      const stats = await stat(resolvedPath);
      
      if (stats.isDirectory()) {
        return json({ error: 'Path is a directory, not a file' }, { status: 400 });
      }
      
      // Check file size (limit to 1MB for safety)
      const maxSize = 1024 * 1024; // 1MB
      if (stats.size > maxSize) {
        return json({ 
          error: 'File too large to display',
          size: stats.size,
          maxSize 
        }, { status: 413 });
      }
      
      // Read file content
      const content = await readFile(resolvedPath, 'utf8');
      
      return json({
        content,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        path,
        encoding: 'utf8'
      });
      
    } catch (fsError: any) {
      console.error('File read error:', fsError);
      
      if (fsError.code === 'ENOENT') {
        return json({ error: 'File not found' }, { status: 404 });
      } else if (fsError.code === 'EACCES') {
        return json({ error: 'Permission denied' }, { status: 403 });
      } else if (fsError.code === 'EISDIR') {
        return json({ error: 'Path is a directory' }, { status: 400 });
      } else {
        return json({ error: 'Failed to read file' }, { status: 500 });
      }
    }
    
  } catch (error) {
    console.error('Workspace file content API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};