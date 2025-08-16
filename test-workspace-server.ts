/**
 * @fileoverview Simple test server for workspace functionality
 */

import { createServer } from 'node:http';
import { readdir, stat, readFile } from 'fs/promises';
import { resolve, join } from 'path';

// Simple workspace server to test functionality
const server = createServer(async (req, res) => {
  const url = req.url || '/';
  
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Health check
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'workspace-test' }));
      return;
    }
    
    // Workspace files API
    if (url === '/api/workspace/files' || url.startsWith('/api/workspace/files?')) {
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);
      const path = params.get('path') || '';
      
      const baseDir = process.cwd();
      const targetPath = path ? join(baseDir, path) : baseDir;
      const resolvedPath = resolve(targetPath);
      
      if (!resolvedPath.startsWith(resolve(baseDir))) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Access denied' }));
        return;
      }
      
      try {
        const items = await readdir(resolvedPath);
        const files = [];
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules') continue;
          
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
            console.warn(`Skipping item ${item}:`, itemError);
          }
        }
        
        files.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          files,
          currentPath: path,
          parentPath: path ? path.split('/').slice(0, -1).join('/') : null
        }));
        return;
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read directory' }));
        return;
      }
    }
    
    // Workspace file content API
    if (url === '/api/workspace/files/content' || url.startsWith('/api/workspace/files/content?')) {
      const urlParts = url.split('?');
      const queryString = urlParts[1] || '';
      const params = new URLSearchParams(queryString);
      const path = params.get('path');
      
      if (!path) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path parameter is required' }));
        return;
      }
      
      const baseDir = process.cwd();
      const targetPath = join(baseDir, path);
      const resolvedPath = resolve(targetPath);
      
      if (!resolvedPath.startsWith(resolve(baseDir))) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Access denied' }));
        return;
      }
      
      try {
        const stats = await stat(resolvedPath);
        
        if (stats.isDirectory()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Path is a directory' }));
          return;
        }
        
        const maxSize = 1024 * 1024; // 1MB
        if (stats.size > maxSize) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'File too large to display',
            size: stats.size,
            maxSize 
          }));
          return;
        }
        
        const content = await readFile(resolvedPath, 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          content,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          path,
          encoding: 'utf8'
        }));
        return;
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read file' }));
        }
        return;
      }
    }
    
    // Workspace HTML page
    if (url === '/workspace' || url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(generateWorkspaceHtml());
      return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

function generateWorkspaceHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🗂️ Workspace - Claude Code Zen</title>
  <style>
    :root {
      --bg-primary: #1a1a1a;
      --bg-secondary: #2d2d2d;
      --bg-tertiary: #3d3d3d;
      --text-primary: #ffffff;
      --text-secondary: #cccccc;
      --text-muted: #888888;
      --accent-primary: #00d4ff;
      --accent-error: #ff4757;
      --border-primary: #404040;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: var(--bg-secondary);
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--border-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .workspace-layout {
      display: flex;
      flex: 1;
      min-height: 0;
    }
    
    .file-explorer {
      width: 300px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-primary);
      display: flex;
      flex-direction: column;
    }
    
    .explorer-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .file-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    
    .file-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .file-item:hover {
      background: var(--bg-tertiary);
    }
    
    .file-item.selected {
      background: var(--accent-primary);
      color: var(--bg-primary);
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
    }
    
    .content-header {
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--border-primary);
    }
    
    .content-body {
      flex: 1;
      padding: 2rem;
      overflow: auto;
    }
    
    .file-content {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-primary);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow: auto;
      max-height: 70vh;
    }
    
    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }
    
    .btn {
      background: var(--accent-primary);
      color: var(--bg-primary);
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    
    .btn:hover {
      opacity: 0.8;
    }
    
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: var(--bg-tertiary);
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875rem;
    }
    
    .breadcrumb button {
      background: none;
      border: none;
      color: var(--accent-primary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 3px;
    }
    
    .breadcrumb button:hover {
      background: var(--bg-secondary);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🗂️ Workspace - Claude Code Zen</h1>
    <button class="btn" onclick="refreshFiles()">🔄 Refresh</button>
  </div>
  
  <div class="workspace-layout">
    <div class="file-explorer">
      <div class="explorer-header">
        <h3>📁 Files</h3>
      </div>
      
      <div id="breadcrumb"></div>
      
      <div class="file-list" id="fileList">
        <div class="loading">📁 Loading files...</div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="content-header">
        <h2 id="contentTitle">Welcome to Workspace</h2>
        <p id="contentMeta">Select a file to view its content</p>
      </div>
      
      <div class="content-body">
        <div id="fileContent">
          <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
            <h3>🎯 Claude Code Zen Workspace</h3>
            <p>Browse and explore your project files</p>
            <br>
            <p>Click on folders to navigate, click on files to view content</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentPath = '';
    let selectedFile = null;
    
    async function loadFiles(path = '') {
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '<div class="loading">📁 Loading files...</div>';
      
      try {
        const response = await fetch(\`/api/workspace/files?path=\${encodeURIComponent(path)}\`);
        const data = await response.json();
        
        currentPath = data.currentPath || '';
        updateBreadcrumb();
        
        fileList.innerHTML = '';
        
        if (data.files && data.files.length > 0) {
          data.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = \`
              <span>\${file.type === 'directory' ? '📁' : '📄'}</span>
              <span>\${file.name}</span>
              \${file.size ? \`<span style="margin-left: auto; font-size: 0.75rem; color: var(--text-muted);">\${Math.round(file.size / 1024)}KB</span>\` : ''}
            \`;
            
            item.onclick = () => handleFileClick(file);
            fileList.appendChild(item);
          });
        } else {
          fileList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); text-align: center;">📄 No files found</div>';
        }
      } catch (error) {
        console.error('Error loading files:', error);
        fileList.innerHTML = '<div style="padding: 1rem; color: var(--accent-error); text-align: center;">❌ Error loading files</div>';
      }
    }
    
    function updateBreadcrumb() {
      const breadcrumb = document.getElementById('breadcrumb');
      
      if (!currentPath) {
        breadcrumb.innerHTML = '';
        return;
      }
      
      breadcrumb.innerHTML = \`
        <div class="breadcrumb">
          <button onclick="goBack()">⬅️</button>
          <span>/\${currentPath}</span>
        </div>
      \`;
    }
    
    function goBack() {
      const pathParts = currentPath.split('/');
      pathParts.pop();
      const newPath = pathParts.join('/');
      loadFiles(newPath);
    }
    
    async function handleFileClick(file) {
      // Remove previous selection
      document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Add selection to clicked item
      event.target.closest('.file-item').classList.add('selected');
      
      if (file.type === 'directory') {
        const newPath = currentPath ? \`\${currentPath}/\${file.name}\` : file.name;
        loadFiles(newPath);
      } else {
        selectedFile = file;
        await loadFileContent(file.path);
      }
    }
    
    async function loadFileContent(filePath) {
      const contentTitle = document.getElementById('contentTitle');
      const contentMeta = document.getElementById('contentMeta');
      const fileContent = document.getElementById('fileContent');
      
      contentTitle.textContent = \`📄 \${selectedFile.name}\`;
      contentMeta.textContent = 'Loading file content...';
      fileContent.innerHTML = '<div class="loading">📄 Loading file content...</div>';
      
      try {
        const response = await fetch(\`/api/workspace/files/content?path=\${encodeURIComponent(filePath)}\`);
        
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}\`);
        }
        
        const data = await response.json();
        
        contentMeta.textContent = \`Size: \${Math.round(data.size / 1024)}KB | Modified: \${new Date(data.modified).toLocaleDateString()}\`;
        
        fileContent.innerHTML = \`<div class="file-content">\${data.content}</div>\`;
        
      } catch (error) {
        console.error('Error loading file content:', error);
        contentMeta.textContent = 'Error loading file';
        fileContent.innerHTML = '<div style="padding: 2rem; color: var(--accent-error); text-align: center;">❌ Error loading file content</div>';
      }
    }
    
    function refreshFiles() {
      loadFiles(currentPath);
    }
    
    // Initialize
    loadFiles();
  </script>
</body>
</html>
  `;
}

const PORT = 3000;

server.listen(PORT, 'localhost', () => {
  console.log(`🗂️ Workspace server running on http://localhost:${PORT}`);
  console.log(`   - Workspace: http://localhost:${PORT}/workspace`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
});