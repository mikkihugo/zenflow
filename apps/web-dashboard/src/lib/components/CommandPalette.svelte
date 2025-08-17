<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { websocketStore } from '$stores/websocket';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  
  let searchQuery = '';
  let selectedIndex = 0;
  let commandInput: HTMLInputElement;
  
  // Command categories and actions
  const commands = [
    // File Operations
    { id: 'file.new', title: 'New File', description: 'Create a new file', category: 'File', icon: '📄', shortcut: 'Ctrl+N' },
    { id: 'file.open', title: 'Open File', description: 'Open an existing file', category: 'File', icon: '📂', shortcut: 'Ctrl+O' },
    { id: 'file.save', title: 'Save File', description: 'Save current file', category: 'File', icon: '💾', shortcut: 'Ctrl+S' },
    { id: 'file.saveAll', title: 'Save All', description: 'Save all open files', category: 'File', icon: '💾', shortcut: 'Ctrl+Shift+S' },
    
    // Project Operations
    { id: 'project.build', title: 'Build Project', description: 'Build the entire project', category: 'Project', icon: '🔨', shortcut: 'Ctrl+Shift+B' },
    { id: 'project.test', title: 'Run Tests', description: 'Execute test suite', category: 'Project', icon: '🧪', shortcut: 'Ctrl+Shift+T' },
    { id: 'project.lint', title: 'Lint Code', description: 'Run code linting', category: 'Project', icon: '🔍', shortcut: 'Ctrl+Shift+L' },
    { id: 'project.format', title: 'Format Code', description: 'Format all code files', category: 'Project', icon: '✨', shortcut: 'Ctrl+Shift+F' },
    
    // Swarm Operations
    { id: 'swarm.init', title: 'Initialize Swarm', description: 'Create a new AI swarm', category: 'Swarm', icon: '🐝', shortcut: 'Ctrl+Shift+I' },
    { id: 'swarm.spawn', title: 'Spawn Agent', description: 'Add a new agent to swarm', category: 'Swarm', icon: '🤖', shortcut: 'Ctrl+Shift+A' },
    { id: 'swarm.status', title: 'Swarm Status', description: 'View swarm coordination status', category: 'Swarm', icon: '📊', shortcut: 'Ctrl+Shift+M' },
    { id: 'swarm.monitor', title: 'Monitor Swarm', description: 'Real-time swarm monitoring', category: 'Swarm', icon: '👀', shortcut: 'Ctrl+Shift+W' },
    
    // Development Operations  
    { id: 'dev.server', title: 'Start Dev Server', description: 'Start development server', category: 'Dev', icon: '🚀', shortcut: 'F5' },
    { id: 'dev.stop', title: 'Stop Dev Server', description: 'Stop development server', category: 'Dev', icon: '🛑', shortcut: 'Shift+F5' },
    { id: 'dev.restart', title: 'Restart Server', description: 'Restart development server', category: 'Dev', icon: '🔄', shortcut: 'Ctrl+F5' },
    { id: 'dev.logs', title: 'View Logs', description: 'Open development logs', category: 'Dev', icon: '📝', shortcut: 'Ctrl+Shift+U' },
    
    // Navigation
    { id: 'nav.explorer', title: 'File Explorer', description: 'Open file explorer', category: 'Navigation', icon: '🗂️', shortcut: 'Ctrl+Shift+E' },
    { id: 'nav.terminal', title: 'Terminal', description: 'Open integrated terminal', category: 'Navigation', icon: '💻', shortcut: 'Ctrl+`' },
    { id: 'nav.search', title: 'Search Files', description: 'Search across project files', category: 'Navigation', icon: '🔍', shortcut: 'Ctrl+Shift+F' },
    { id: 'nav.go-to-file', title: 'Go to File', description: 'Quick file navigation', category: 'Navigation', icon: '📄', shortcut: 'Ctrl+P' },
    
    // Settings
    { id: 'settings.preferences', title: 'Preferences', description: 'Open user preferences', category: 'Settings', icon: '⚙️', shortcut: 'Ctrl+,' },
    { id: 'settings.workspace', title: 'Workspace Settings', description: 'Configure workspace', category: 'Settings', icon: '🏗️', shortcut: 'Ctrl+Shift+,' },
    { id: 'settings.theme', title: 'Change Theme', description: 'Switch color theme', category: 'Settings', icon: '🎨', shortcut: 'Ctrl+K Ctrl+T' },
    
    // Advanced
    { id: 'advanced.neural', title: 'Neural Training', description: 'Start neural pattern training', category: 'Advanced', icon: '🧠', shortcut: 'Ctrl+Shift+N' },
    { id: 'advanced.benchmark', title: 'Run Benchmarks', description: 'Performance benchmarking', category: 'Advanced', icon: '⚡', shortcut: 'Ctrl+Shift+B' },
    { id: 'advanced.export', title: 'Export Project', description: 'Export project data', category: 'Advanced', icon: '📦', shortcut: 'Ctrl+Shift+E' },
  ];
  
  // Filter commands based on search query
  $: filteredCommands = searchQuery 
    ? commands.filter(cmd => 
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commands;
    
  // Group commands by category
  $: groupedCommands = filteredCommands.reduce((groups, cmd) => {
    if (!groups[cmd.category]) {
      groups[cmd.category] = [];
    }
    groups[cmd.category].push(cmd);
    return groups;
  }, {} as Record<string, typeof commands>);
  
  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    
    const totalCommands = filteredCommands.length;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % totalCommands;
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = selectedIndex === 0 ? totalCommands - 1 : selectedIndex - 1;
        break;
        
      case 'Enter':
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
        
      case 'Tab':
        event.preventDefault();
        // Auto-complete with first result
        if (filteredCommands[0]) {
          searchQuery = filteredCommands[0].title;
        }
        break;
    }
  }
  
  // Execute selected command
  async function executeCommand(command: typeof commands[0]) {
    console.log(`🎯 Executing command: ${command.id}`);
    
    try {
      // Send command to backend via WebSocket
      if ($websocketStore.socket) {
        $websocketStore.socket.emit('command', {
          id: command.id,
          title: command.title,
          timestamp: Date.now()
        });
      }
      
      // Handle specific commands using real workspace API
      switch (command.id) {
        case 'file.new':
          await createNewFile();
          break;
          
        case 'file.open':
          await openFileDialog();
          break;
          
        case 'project.build':
          await executeProjectCommand('npm', ['run', 'build']);
          break;
          
        case 'project.test':
          await executeProjectCommand('npm', ['test']);
          break;
          
        case 'project.lint':
          await executeProjectCommand('npm', ['run', 'lint']);
          break;
          
        case 'project.format':
          await executeProjectCommand('npm', ['run', 'format']);
          break;
          
        case 'swarm.init':
          await initializeSwarm();
          break;
          
        case 'swarm.spawn':
          await spawnAgent();
          break;
          
        case 'swarm.status':
          await showSwarmStatus();
          break;
          
        case 'dev.server':
          await executeProjectCommand('npm', ['run', 'dev']);
          break;
          
        case 'dev.restart':
          await executeProjectCommand('npm', ['run', 'dev:watch']);
          break;
          
        case 'nav.explorer':
          await showFileExplorer();
          break;
          
        case 'nav.go-to-file':
          await showGoToFile();
          break;
          
        case 'nav.search':
          await showFileSearch();
          break;
          
        case 'nav.terminal':
          await openTerminal();
          break;
          
        case 'settings.preferences':
          await openSettings();
          break;
          
        case 'advanced.neural':
          await startNeuralTraining();
          break;
          
        case 'advanced.benchmark':
          await runBenchmarks();
          break;
          
        default:
          console.log(`Command ${command.id} not implemented yet`);
          showToast(`Command ${command.title} is not yet implemented`, 'info');
      }
      
      // Close palette after execution
      close();
      
    } catch (error) {
      console.error('Command execution failed:', error);
      showToast(`Command failed: ${error.message}`, 'error');
    }
  }

  // Command implementations using workspace API
  async function createNewFile() {
    const fileName = prompt('Enter file name:', 'new-file.ts');
    if (fileName) {
      const template = getFileTemplate(fileName);
      const response = await fetch('/api/workspace/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: fileName, 
          template: template,
          content: '' 
        })
      });
      
      if (response.ok) {
        showToast(`File created: ${fileName}`, 'success');
        dispatch('file-created', { fileName });
      } else {
        throw new Error('Failed to create file');
      }
    }
  }

  async function openFileDialog() {
    // Get recent files to show in dialog
    const response = await fetch('/api/workspace/recent');
    const data = await response.json();
    
    if (data.files.length > 0) {
      const fileList = data.files.map(f => f.name).join('\n');
      const fileName = prompt(`Select file to open:\n${fileList}\n\nOr enter file path:`);
      
      if (fileName) {
        dispatch('file-open', { fileName });
        showToast(`Opening: ${fileName}`, 'info');
      }
    } else {
      const fileName = prompt('Enter file path to open:');
      if (fileName) {
        dispatch('file-open', { fileName });
      }
    }
  }

  async function executeProjectCommand(command: string, args: string[] = []) {
    showToast(`Executing: ${command} ${args.join(' ')}`, 'info');
    
    const response = await fetch('/api/workspace/project/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, args })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`Command completed successfully`, 'success');
      console.log('Command output:', result.stdout);
    } else {
      showToast(`Command failed (exit code: ${result.exitCode})`, 'error');
      console.error('Command error:', result.stderr);
    }
  }

  async function initializeSwarm() {
    const response = await fetch('/api/swarms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Swarm-${Date.now()}`,
        topology: 'hierarchical',
        maxAgents: 6
      })
    });
    
    if (response.ok) {
      showToast('Swarm initialized successfully', 'success');
      dispatch('swarm-initialized');
    } else {
      throw new Error('Failed to initialize swarm');
    }
  }

  async function spawnAgent() {
    const agentType = prompt('Enter agent type (researcher, coder, analyst, tester, coordinator):');
    if (agentType) {
      showToast(`Spawning ${agentType} agent...`, 'info');
      // Implementation would go here
    }
  }

  async function showSwarmStatus() {
    dispatch('show-swarm-status');
    showToast('Opening swarm status panel', 'info');
  }

  async function showFileExplorer() {
    const response = await fetch('/api/workspace/files');
    const data = await response.json();
    
    dispatch('show-file-explorer', { files: data.files });
    showToast('Opening file explorer', 'info');
  }

  async function showGoToFile() {
    const response = await fetch('/api/workspace/search/files?q=&limit=20');
    const data = await response.json();
    
    dispatch('show-go-to-file', { files: data.results });
    showToast('Opening Go to File dialog', 'info');
  }

  async function showFileSearch() {
    const query = prompt('Search for files:');
    if (query) {
      const response = await fetch(`/api/workspace/search/files?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      dispatch('show-search-results', { query, results: data.results });
      showToast(`Found ${data.count} files matching "${query}"`, 'info');
    }
  }

  async function openTerminal() {
    showToast('Opening integrated terminal...', 'info');
    dispatch('open-terminal');
  }

  async function openSettings() {
    dispatch('open-settings');
    showToast('Opening preferences', 'info');
  }

  async function startNeuralTraining() {
    showToast('Starting neural pattern training...', 'info');
    dispatch('start-neural-training');
  }

  async function runBenchmarks() {
    await executeProjectCommand('npm', ['run', 'benchmark']);
  }

  // Utility functions
  function getFileTemplate(fileName: string): string | undefined {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts': return 'typescript';
      case 'tsx': return 'react';
      case 'svelte': return 'svelte';
      case 'md': return 'markdown';
      default: return undefined;
    }
  }

  function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    // Simple toast notification - could be enhanced with a proper toast system
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Dispatch event for toast notifications
    dispatch('toast', { message, type });
  }
  
  function close() {
    isOpen = false;
    searchQuery = '';
    selectedIndex = 0;
    dispatch('close');
  }
  
  // Focus input when opened
  $: if (isOpen && commandInput) {
    commandInput.focus();
  }
  
  // Global keyboard listener
  onMount(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      // Ctrl+Shift+P to open command palette
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        isOpen = !isOpen;
      }
    }
    
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="command-palette-backdrop" on:click={close}>
    <!-- Command Palette Modal -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="command-palette" on:click|stopPropagation>
      <!-- Search Input -->
      <div class="search-container">
        <div class="search-icon">🔍</div>
        <input
          bind:this={commandInput}
          bind:value={searchQuery}
          placeholder="Type a command or search..."
          class="search-input"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="search-shortcut">Ctrl+Shift+P</div>
      </div>
      
      <!-- Commands List -->
      <div class="commands-container">
        {#if filteredCommands.length === 0}
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <div class="no-results-text">No commands found</div>
            <div class="no-results-hint">Try searching for something else</div>
          </div>
        {:else}
          {#each Object.entries(groupedCommands) as [category, categoryCommands], categoryIndex}
            <div class="command-category">
              <div class="category-header">{category}</div>
              {#each categoryCommands as command, commandIndex}
                {@const globalIndex = filteredCommands.indexOf(command)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div 
                  class="command-item"
                  class:selected={globalIndex === selectedIndex}
                  on:click={() => executeCommand(command)}
                  on:mouseenter={() => selectedIndex = globalIndex}
                >
                  <div class="command-main">
                    <div class="command-icon">{command.icon}</div>
                    <div class="command-info">
                      <div class="command-title">{command.title}</div>
                      <div class="command-description">{command.description}</div>
                    </div>
                  </div>
                  <div class="command-shortcut">{command.shortcut}</div>
                </div>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="command-footer">
        <div class="footer-shortcuts">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Execute</span>
          <span><kbd>Tab</kbd> Complete</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
        <div class="footer-info">
          {filteredCommands.length} commands available
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .command-palette-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 15vh;
    animation: fadeIn 0.2s ease;
  }
  
  .command-palette {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 70vh;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    overflow: hidden;
  }
  
  .search-container {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-primary);
    gap: 12px;
  }
  
  .search-icon {
    font-size: 18px;
    opacity: 0.7;
  }
  
  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 16px;
    color: var(--text-primary);
    font-family: inherit;
  }
  
  .search-input::placeholder {
    color: var(--text-muted);
  }
  
  .search-shortcut {
    font-size: 12px;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'SF Mono', Consolas, monospace;
  }
  
  .commands-container {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px 0;
  }
  
  .command-category {
    margin-bottom: 16px;
  }
  
  .category-header {
    padding: 8px 20px 4px 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .command-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    margin: 0 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .command-item:hover,
  .command-item.selected {
    background: var(--bg-tertiary);
    transform: translateX(2px);
  }
  
  .command-item.selected {
    background: var(--accent-primary);
    color: white;
  }
  
  .command-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .command-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }
  
  .command-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .command-title {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.2;
  }
  
  .command-description {
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.3;
  }
  
  .command-item.selected .command-description {
    opacity: 0.9;
  }
  
  .command-shortcut {
    font-size: 11px;
    color: var(--text-muted);
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'SF Mono', Consolas, monospace;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .command-item.selected .command-shortcut {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }
  
  .no-results-icon {
    font-size: 48px;
    opacity: 0.3;
    margin-bottom: 16px;
  }
  
  .no-results-text {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--text-primary);
  }
  
  .no-results-hint {
    font-size: 14px;
    color: var(--text-muted);
  }
  
  .command-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--border-primary);
    background: var(--bg-primary);
  }
  
  .footer-shortcuts {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .footer-shortcuts kbd {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 3px;
    padding: 2px 4px;
    font-size: 10px;
    font-family: 'SF Mono', Consolas, monospace;
  }
  
  .footer-info {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .command-palette-backdrop {
      padding: 10px;
      padding-top: 10vh;
    }
    
    .command-palette {
      max-height: 80vh;
    }
    
    .footer-shortcuts {
      display: none;
    }
  }
</style>