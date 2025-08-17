/**
 * @fileoverview Workspace Files API - Provides file system access for the workspace
 */

import { json } from '@sveltejs/kit';
import { readdir, stat } from 'fs/promises';
import { resolve, join } from 'path';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const path = searchParams.get('path') || '';
    
    // Base directory - use current working directory for now
    const baseDir = process.cwd();
    const targetPath = path ? join(baseDir, path) : baseDir;
    
    // Resolve the path to prevent directory traversal attacks
    const resolvedPath = resolve(targetPath);
    
    // Basic security check - ensure we're within the base directory
    if (!resolvedPath.startsWith(resolve(baseDir))) {
      return json({ error: 'Access denied' }, { status: 403 });
    }
    
    try {
      const items = await readdir(resolvedPath);
      const files = [];
      
      for (const item of items) {
        // Skip hidden files and node_modules for better UX
        if (item.startsWith('.') || item === 'node_modules') {
          continue;
        }
        
        try {
          const itemPath = join(resolvedPath, item);
          const stats = await stat(itemPath);
          
          files.push({
            name: item,
            path: path ? `${path}/${item}` : item,
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.isFile() ? stats.size : undefined,
            modified: stats.mtime.toISOString()
          });
        } catch (itemError) {
          // Skip items we can't stat (permission issues, etc.)
          console.warn(`Skipping item ${item}:`, itemError);
        }
      }
      
      // Sort directories first, then files
      files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      
      return json({
        files,
        currentPath: path,
        parentPath: path ? path.split('/').slice(0, -1).join('/') : null
      });
      
    } catch (fsError) {
      console.error('File system error:', fsError);
      return json({ error: 'Directory not found or access denied' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Workspace files API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};