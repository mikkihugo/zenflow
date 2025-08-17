<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '$lib/styles/app.css';
  import CommandPalette from '$components/CommandPalette.svelte';
  
  let commandPaletteOpen = false;
  
  // Initialize WebSocket connection on app load
  onMount(() => {
    // Connect to existing WebSocket system
    console.log('🚀 Svelte dashboard initialized');
  });
  
  // Handle command palette events
  function handleCommandPaletteClose() {
    commandPaletteOpen = false;
  }
  
  function handleFileNew() {
    console.log('🆕 Creating new file...');
    // Implement file creation logic
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-content">
      <h1>🧠 claude-code-zen</h1>
      <p>AI-Powered Development Toolkit</p>
      <div class="status-indicator">
        <span class="status-dot active"></span>
        Real-time Dashboard
      </div>
    </div>
  </header>

  <nav class="nav">
    <a href="/" class:active={$page.url.pathname === '/'}>
      <span class="icon">🏠</span>
      Dashboard
    </a>
    <a href="/workspace" class:active={$page.url.pathname === '/workspace'}>
      <span class="icon">🗂️</span>
      Workspace
    </a>
    <a href="/status" class:active={$page.url.pathname === '/status'}>
      <span class="icon">⚡</span>
      System Status
    </a>
    <a href="/swarm" class:active={$page.url.pathname === '/swarm'}>
      <span class="icon">🐝</span>
      Swarm Management
    </a>
    <a href="/performance" class:active={$page.url.pathname === '/performance'}>
      <span class="icon">📊</span>
      Performance
    </a>
    <a href="/logs" class:active={$page.url.pathname === '/logs'}>
      <span class="icon">📝</span>
      Live Logs
    </a>
    <a href="/dev-communication" class:active={$page.url.pathname === '/dev-communication'}>
      <span class="icon">💬</span>
      Dev Communication
    </a>
    <a href="/agu" class:active={$page.url.pathname === '/agu' || $page.url.pathname.startsWith('/agu/')}>
      <span class="icon">🛡️</span>
      AGU
    </a>
    <a href="/matron" class:active={$page.url.pathname === '/matron' || $page.url.pathname.startsWith('/matron/')}>
      <span class="icon">🧙‍♀️</span>
      Matron Advisory
    </a>
    <a href="/roadmap" class:active={$page.url.pathname === '/roadmap' || $page.url.pathname.startsWith('/roadmap/')}>
      <span class="icon">🗺️</span>
      Visionary Roadmap
    </a>
    <a href="/settings" class:active={$page.url.pathname === '/settings'}>
      <span class="icon">⚙️</span>
      Settings
    </a>
  </nav>

  <main class="main">
    <slot />
  </main>

  <footer class="footer">
    <p>claude-code-zen v2.0.0 | Svelte Dashboard | Press <kbd>Ctrl+Shift+P</kbd> for Command Palette</p>
  </footer>
</div>

<!-- Command Palette Component -->
<CommandPalette 
  bind:isOpen={commandPaletteOpen}
  on:close={handleCommandPaletteClose}
  on:file-new={handleFileNew}
/>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    padding: 1rem 2rem;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .header h1 {
    font-size: 2.5rem;
    color: var(--accent-primary);
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }

  .header p {
    color: var(--text-secondary);
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-tertiary);
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-success);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .nav {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0 2rem;
  }

  .nav a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    text-decoration: none;
    color: var(--text-secondary);
    border-radius: 8px 8px 0 0;
    border: 1px solid transparent;
    border-bottom: none;
    transition: all 0.2s ease;
    position: relative;
    top: 1px;
  }

  .nav a:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .nav a.active {
    background: var(--bg-primary);
    color: var(--accent-primary);
    border-color: var(--border-primary);
    border-bottom: 1px solid var(--bg-primary);
  }

  .icon {
    font-size: 1rem;
  }

  .main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
    padding: 1rem 2rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .header {
      padding: 1rem;
    }
    
    .header h1 {
      font-size: 1.8rem;
    }
    
    .nav {
      padding: 0 1rem;
      justify-content: flex-start;
      overflow-x: auto;
    }
    
    .main {
      padding: 1rem;
    }
  }
</style>