<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // Workspace state
  let files: any[] = [];
  let currentPath = '';
  let loading = false;
  let error = '';
  let showCommandPalette = false;
  let selectedFile: any = null;
  let fileContent = '';
  let searchQuery = '';

  // File explorer state
  let explorerExpanded = true;
  
  // Command palette commands
  const commands = [
    {
      category: 'File Operations',
      items: [
        { id: 'new-file', title: 'New File', description: 'Create a new file', icon: '📄', shortcut: 'Ctrl+N' },
        { id: 'new-folder', title: 'New Folder', description: 'Create a new folder', icon: '📁', shortcut: 'Ctrl+Shift+N' },
        { id: 'open-file', title: 'Open File', description: 'Open an existing file', icon: '📂', shortcut: 'Ctrl+O' },
        { id: 'save-file', title: 'Save File', description: 'Save current file', icon: '💾', shortcut: 'Ctrl+S' },
      ]
    },
    {
      category: 'Navigation',
      items: [
        { id: 'go-to-file', title: 'Go to File', description: 'Quick file navigation', icon: '🔍', shortcut: 'Ctrl+P' },
        { id: 'go-to-line', title: 'Go to Line', description: 'Jump to specific line', icon: '📍', shortcut: 'Ctrl+G' },
        { id: 'find-in-files', title: 'Find in Files', description: 'Search across all files', icon: '🔎', shortcut: 'Ctrl+Shift+F' },
      ]
    },
    {
      category: 'Project',
      items: [
        { id: 'run-command', title: 'Run Command', description: 'Execute project command', icon: '⚡', shortcut: 'Ctrl+`' },
        { id: 'git-status', title: 'Git Status', description: 'View git repository status', icon: '🌿', shortcut: 'Ctrl+Shift+G' },
        { id: 'project-info', title: 'Project Info', description: 'View project information', icon: 'ℹ️', shortcut: '' },
      ]
    }
  ];

  let filteredCommands = commands;
  let selectedCommandIndex = 0;

  // API functions
  async function loadFiles(path = '') {
    if (!browser) return;
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch(`/api/workspace/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to load files');
      }
      
      const data = await response.json();
      files = data.files || [];
      currentPath = data.currentPath || path;
    } catch (err) {
      error = err.message || 'Failed to load files';
      console.error('Error loading files:', err);
    } finally {
      loading = false;
    }
  }

  async function loadFileContent(filePath: string) {
    if (!browser) return;
    
    loading = true;
    
    try {
      const response = await fetch(`/api/workspace/files/content?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        throw new Error('Failed to load file content');
      }
      
      const data = await response.json();
      fileContent = data.content || '';
    } catch (err) {
      error = err.message || 'Failed to load file content';
      console.error('Error loading file content:', err);
    } finally {
      loading = false;
    }
  }

  // Event handlers
  function handleFileClick(file: any) {
    if (file.type === 'directory') {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      loadFiles(newPath);
    } else {
      selectedFile = file;
      loadFileContent(file.path);
    }
  }

  function handleBackClick() {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    loadFiles(newPath);
  }

  function toggleCommandPalette() {
    showCommandPalette = !showCommandPalette;
    if (showCommandPalette) {
      searchQuery = '';
      filterCommands();
      selectedCommandIndex = 0;
    }
  }

  function filterCommands() {
    if (!searchQuery.trim()) {
      filteredCommands = commands;
    } else {
      filteredCommands = commands.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0);
    }
    selectedCommandIndex = 0;
  }

  function executeCommand(commandId: string) {
    console.log('Executing command:', commandId);
    showCommandPalette = false;
    
    // Implement command execution logic here
    switch (commandId) {
      case 'new-file':
        // TODO: Implement new file creation
        break;
      case 'new-folder':
        // TODO: Implement new folder creation
        break;
      case 'git-status':
        // TODO: Show git status
        break;
      default:
        console.log('Command not implemented:', commandId);
    }
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      toggleCommandPalette();
    } else if (showCommandPalette) {
      if (event.key === 'Escape') {
        showCommandPalette = false;
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const totalCommands = filteredCommands.reduce((sum, cat) => sum + cat.items.length, 0);
        selectedCommandIndex = (selectedCommandIndex + 1) % totalCommands;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const totalCommands = filteredCommands.reduce((sum, cat) => sum + cat.items.length, 0);
        selectedCommandIndex = selectedCommandIndex === 0 ? totalCommands - 1 : selectedCommandIndex - 1;
      } else if (event.key === 'Enter') {
        event.preventDefault();
        let commandIndex = 0;
        for (const category of filteredCommands) {
          for (const item of category.items) {
            if (commandIndex === selectedCommandIndex) {
              executeCommand(item.id);
              return;
            }
            commandIndex++;
          }
        }
      }
    }
  }

  // Initialize
  onMount(() => {
    loadFiles();
    
    // Add global keyboard listener
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
  
  // Watch search query changes
  $: if (showCommandPalette) filterCommands();
</script>

<svelte:head>
  <title>Workspace - Claude Code Zen</title>
</svelte:head>

<div class="workspace">
  <div class="workspace-header">
    <h1>🗂️ Workspace</h1>
    <div class="workspace-actions">
      <button class="btn primary" on:click={toggleCommandPalette}>
        <span>🎯</span> Command Palette
        <kbd>Ctrl+Shift+P</kbd>
      </button>
    </div>
  </div>

  <div class="workspace-layout">
    <!-- File Explorer -->
    <div class="file-explorer" class:collapsed={!explorerExpanded}>
      <div class="explorer-header">
        <button class="collapse-btn" on:click={() => explorerExpanded = !explorerExpanded}>
          {explorerExpanded ? '📁' : '📂'}
        </button>
        <h3>Files</h3>
        <button class="btn-icon" title="Refresh">🔄</button>
      </div>
      
      {#if explorerExpanded}
        <div class="explorer-content">
          <!-- Breadcrumb -->
          {#if currentPath}
            <div class="breadcrumb">
              <button class="breadcrumb-btn" on:click={handleBackClick}>⬅️</button>
              <span class="path">/{currentPath}</span>
            </div>
          {/if}

          <!-- Files list -->
          {#if loading}
            <div class="loading">📁 Loading files...</div>
          {:else if error}
            <div class="error">❌ {error}</div>
          {:else if files.length === 0}
            <div class="empty">📄 No files found</div>
          {:else}
            <div class="files-list">
              {#each files as file}
                <button 
                  class="file-item"
                  class:selected={selectedFile?.path === file.path}
                  on:click={() => handleFileClick(file)}
                >
                  <span class="file-icon">
                    {file.type === 'directory' ? '📁' : '📄'}
                  </span>
                  <span class="file-name">{file.name}</span>
                  {#if file.type === 'file' && file.size}
                    <span class="file-size">{Math.round(file.size / 1024)}KB</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Main Content -->
    <div class="main-content">
      {#if selectedFile}
        <div class="file-viewer">
          <div class="file-header">
            <h3>📄 {selectedFile.name}</h3>
            <div class="file-meta">
              <span>Size: {Math.round(selectedFile.size / 1024)}KB</span>
              <span>Modified: {new Date(selectedFile.modified).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div class="file-content">
            {#if loading}
              <div class="loading">📄 Loading file content...</div>
            {:else if fileContent}
              <pre><code>{fileContent}</code></pre>
            {:else}
              <div class="empty">📄 File is empty</div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="welcome">
          <h2>🎯 Welcome to Workspace</h2>
          <p>Select a file from the explorer to view its content, or use the command palette to perform actions.</p>
          
          <div class="quick-actions">
            <button class="btn primary" on:click={toggleCommandPalette}>
              🎯 Open Command Palette
            </button>
            <button class="btn" on:click={() => loadFiles()}>
              🔄 Refresh Files
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Command Palette Modal -->
{#if showCommandPalette}
  <div class="command-palette-backdrop" on:click={() => showCommandPalette = false}>
    <div class="command-palette" on:click|stopPropagation>
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          class="search-input" 
          bind:value={searchQuery}
          placeholder="Type a command..."
          autofocus
        />
        <span class="search-shortcut">ESC</span>
      </div>
      
      <div class="commands-container">
        {#if filteredCommands.length === 0}
          <div class="no-results">
            <div class="no-results-icon">🤷</div>
            <div class="no-results-text">No commands found</div>
            <div class="no-results-hint">Try a different search term</div>
          </div>
        {:else}
          {#each filteredCommands as category}
            <div class="command-category">
              <div class="category-header">{category.category}</div>
              {#each category.items as command, index}
                {@const globalIndex = filteredCommands.slice(0, filteredCommands.indexOf(category)).reduce((sum, cat) => sum + cat.items.length, 0) + index}
                <div 
                  class="command-item"
                  class:selected={globalIndex === selectedCommandIndex}
                  on:click={() => executeCommand(command.id)}
                >
                  <div class="command-main">
                    <span class="command-icon">{command.icon}</span>
                    <div class="command-info">
                      <div class="command-title">{command.title}</div>
                      <div class="command-description">{command.description}</div>
                    </div>
                  </div>
                  {#if command.shortcut}
                    <span class="command-shortcut">{command.shortcut}</span>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
      
      <div class="command-footer">
        <div class="footer-shortcuts">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Execute</span>
        </div>
        <div class="footer-info">
          {filteredCommands.reduce((sum, cat) => sum + cat.items.length, 0)} commands
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .workspace {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-primary);
    margin-bottom: 1rem;
  }

  .workspace-header h1 {
    margin: 0;
    color: var(--accent-primary);
  }

  .workspace-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .workspace-actions kbd {
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }

  .workspace-layout {
    display: flex;
    flex: 1;
    gap: 1rem;
    min-height: 0;
  }

  /* File Explorer */
  .file-explorer {
    width: 300px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
  }

  .file-explorer.collapsed {
    width: 50px;
  }

  .explorer-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-primary);
  }

  .collapse-btn, .btn-icon {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  .collapse-btn:hover, .btn-icon:hover {
    background: var(--bg-tertiary);
  }

  .explorer-header h3 {
    margin: 0;
    flex: 1;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .explorer-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-primary);
    font-size: 0.875rem;
  }

  .breadcrumb-btn {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  .breadcrumb-btn:hover {
    background: var(--bg-primary);
  }

  .path {
    color: var(--text-muted);
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 0.75rem;
  }

  .files-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    width: 100%;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s ease;
    font-size: 0.875rem;
  }

  .file-item:hover {
    background: var(--bg-tertiary);
  }

  .file-item.selected {
    background: var(--accent-primary);
    color: white;
  }

  .file-name {
    flex: 1;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .file-size {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: 'SF Mono', Consolas, monospace;
  }

  .file-item.selected .file-size {
    color: rgba(255, 255, 255, 0.8);
  }

  /* Main Content */
  .main-content {
    flex: 1;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .file-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .file-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-primary);
  }

  .file-header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--accent-primary);
  }

  .file-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .file-content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }

  .file-content pre {
    margin: 0;
    font-family: 'SF Mono', Consolas, 'Liberation Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-primary);
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border-primary);
    overflow: auto;
  }

  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
  }

  .welcome h2 {
    margin-bottom: 1rem;
    color: var(--accent-primary);
  }

  .welcome p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    max-width: 400px;
    line-height: 1.6;
  }

  .quick-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .loading, .error, .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .error {
    color: var(--accent-error);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .workspace-layout {
      flex-direction: column;
    }

    .file-explorer {
      width: 100%;
      height: 200px;
    }

    .file-explorer.collapsed {
      height: 50px;
      width: 100%;
    }
  }
</style>