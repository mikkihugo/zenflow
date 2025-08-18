<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '$lib/styles/app.css';
  import CommandPalette from '$components/CommandPalette.svelte';
  import { projectStore, currentProject, projects } from '$lib/stores/project';
  import type { Project } from '$lib/types/dashboard';
  // import { AppShell, AppBar } from '@skeletonlabs/skeleton-svelte';
  
  let commandPaletteOpen = false;
  let projectDropdownOpen = false;
  
  // Initialize WebSocket connection on app load
  onMount(() => {
    // Connect to existing WebSocket system
    console.log('🚀 Svelte dashboard initialized');
    projectStore.loadProjects();
  });
  
  // Handle command palette events
  function handleCommandPaletteClose() {
    commandPaletteOpen = false;
  }
  
  function handleFileNew() {
    console.log('🆕 Creating new file...');
    // Implement file creation logic
  }
  
  function toggleProjectDropdown() {
    projectDropdownOpen = !projectDropdownOpen;
  }
  
  function selectProject(project: Project) {
    projectStore.setCurrentProject(project);
    projectDropdownOpen = false;
  }
  
  function handleCreateNewProject() {
    console.log('🆕 Creating new project...');
    projectDropdownOpen = false;
    // Navigate to project creation page or open modal
  }
  
  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.project-dropdown')) {
      projectDropdownOpen = false;
    }
  }
  
  // Determine if current page is project-related
  $: isProjectRelatedPage = $page.url.pathname.includes('/workspace') || 
                           $page.url.pathname.includes('/roadmap') ||
                           $page.url.pathname.includes('/matron') ||
                           $page.url.pathname.includes('/agu');
</script>

<div class="min-h-screen flex flex-col bg-surface-50-900-token text-token">
  <!-- Top App Bar -->
  <header class="bg-surface-100-800-token border-b border-surface-300-600-token">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h1 class="h4 text-primary-500 font-bold">🧠 claude-code-zen</h1>
          <span class="badge variant-soft-secondary">v2.0.0</span>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Project Selector -->
          <div class="project-dropdown relative" class:project-related={isProjectRelatedPage}>
            <button 
              class="btn variant-ghost-surface"
              class:variant-outline-warning={isProjectRelatedPage}
              on:click={toggleProjectDropdown}
              aria-haspopup="true"
              aria-expanded={projectDropdownOpen}
            >
              <span>📁</span>
              <span>{$currentProject?.name || 'Select Project'}</span>
              <span class="transform transition-transform duration-200" class:rotate-180={projectDropdownOpen}>▼</span>
            </button>
            
            {#if projectDropdownOpen}
              <div class="card p-4 w-80 shadow-xl absolute top-full right-0 mt-2 z-50">
                <header class="pb-2">
                  <h3 class="h6 text-surface-600-300-token">Switch Project</h3>
                </header>
                
                <div class="space-y-2">
                  {#each $projects as project}
                    <button 
                      class="btn w-full justify-start"
                      class:variant-filled-primary={$currentProject?.id === project.id}
                      class:variant-ghost-surface={$currentProject?.id !== project.id}
                      on:click={() => selectProject(project)}
                    >
                      <div class="flex flex-col items-start w-full">
                        <div class="flex justify-between items-center w-full">
                          <span class="font-medium">{project.name}</span>
                          <span class="badge variant-soft-{project.status === 'active' ? 'success' : project.status === 'paused' ? 'warning' : 'secondary'} text-xs">{project.status}</span>
                        </div>
                        <div class="flex justify-between items-center w-full text-xs opacity-75">
                          <span>{project.progress}%</span>
                          <span>{project.currentPhase || 'planning'}</span>
                        </div>
                      </div>
                    </button>
                  {/each}
                </div>
                
                <hr class="opacity-50 my-3" />
                <button class="btn variant-ghost-success w-full" on:click={handleCreateNewProject}>
                  <span>➕</span>
                  Create New Project
                </button>
              </div>
            {/if}
          </div>
          
          <!-- Status Indicator -->
          <div class="badge variant-soft-success flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
            Real-time
          </div>
        </div>
      </div>
    </div>
    
    <!-- Navigation Bar -->
    <div class="border-t border-surface-300-600-token">
      <div class="container mx-auto px-6">
        <nav class="flex gap-1 overflow-x-auto">
          <a href="/" class="tab" class:tab-active={$page.url.pathname === '/'}>
            <span>🏠</span>
            Dashboard
          </a>
          <a href="/workspace" class="tab" class:tab-active={$page.url.pathname === '/workspace'}>
            <span>🗂️</span>
            Workspace
          </a>
          <a href="/status" class="tab" class:tab-active={$page.url.pathname === '/status'}>
            <span>⚡</span>
            System Status
          </a>
          <a href="/swarm" class="tab" class:tab-active={$page.url.pathname === '/swarm'}>
            <span>🐝</span>
            Swarm Management
          </a>
          <a href="/performance" class="tab" class:tab-active={$page.url.pathname === '/performance'}>
            <span>📊</span>
            Performance
          </a>
          <a href="/logs" class="tab" class:tab-active={$page.url.pathname === '/logs'}>
            <span>📝</span>
            Live Logs
          </a>
          <a href="/dev-communication" class="tab" class:tab-active={$page.url.pathname === '/dev-communication'}>
            <span>💬</span>
            Dev Communication
          </a>
          <a href="/agu" class="tab" class:tab-active={$page.url.pathname === '/agu' || $page.url.pathname.startsWith('/agu/')}>
            <span>🛡️</span>
            AGU
          </a>
          <a href="/matron" class="tab" class:tab-active={$page.url.pathname === '/matron' || $page.url.pathname.startsWith('/matron/')}>
            <span>🧙‍♀️</span>
            Matron Advisory
          </a>
          <a href="/roadmap" class="tab" class:tab-active={$page.url.pathname === '/roadmap' || $page.url.pathname.startsWith('/roadmap/')}>
            <span>🗺️</span>
            Visionary Roadmap
          </a>
          <a href="/settings" class="tab" class:tab-active={$page.url.pathname === '/settings'}>
            <span>⚙️</span>
            Settings
          </a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 container mx-auto p-6">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-surface-100-800-token border-t border-surface-300-600-token p-4 text-center">
    <p class="text-sm text-surface-600-300-token">
      claude-code-zen v2.0.0 | Svelte Dashboard | Press 
      <kbd class="kbd kbd-sm">Ctrl</kbd>+<kbd class="kbd kbd-sm">Shift</kbd>+<kbd class="kbd kbd-sm">P</kbd> 
      for Command Palette
    </p>
  </footer>
</div>

<!-- Command Palette Component -->
<CommandPalette 
  bind:isOpen={commandPaletteOpen}
  on:close={handleCommandPaletteClose}
  on:file-new={handleFileNew}
/>

<!-- Click outside handler for project dropdown -->
<svelte:window on:click={handleClickOutside} />

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  /* Top Bar Styles */
  .topbar {
    background: var(--bg-secondary);
    border-bottom: 2px solid var(--border-primary);
    padding: 0.75rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .topbar-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-section h1 {
    font-size: 1.5rem;
    color: var(--accent-primary);
    margin: 0;
    font-weight: 600;
  }

  .version {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Project Dropdown Styles */
  .project-dropdown {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 300px;
  }

  .project-dropdown.project-related {
    border: 2px solid var(--accent-warning);
    border-radius: 8px;
    padding: 2px;
    background: linear-gradient(45deg, var(--accent-warning), var(--accent-primary));
  }

  .project-selector {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 280px;
    justify-content: space-between;
  }

  .project-selector:hover {
    background: var(--bg-quaternary);
    border-color: var(--accent-primary);
  }

  .project-selector.required {
    border-color: var(--accent-warning);
    background: var(--bg-primary);
  }

  .project-icon {
    font-size: 1rem;
  }

  .project-name {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  .dropdown-arrow {
    transition: transform 0.2s ease;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    margin-top: 4px;
    max-height: 400px;
    overflow-y: auto;
  }

  .dropdown-header {
    padding: 0.75rem 1rem 0.5rem;
    border-bottom: 1px solid var(--border-primary);
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .dropdown-item {
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .dropdown-item:hover {
    background: var(--bg-tertiary);
  }

  .dropdown-item.active {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }

  .dropdown-item.create-new {
    border-top: 1px solid var(--border-primary);
    color: var(--accent-success);
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .project-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .project-title {
    font-weight: 500;
    color: var(--text-primary);
  }

  .dropdown-item.active .project-title {
    color: var(--bg-primary);
  }

  .project-status {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
    border-radius: 12px;
    text-transform: capitalize;
  }

  .project-status.status-active {
    background: var(--accent-success);
    color: var(--bg-primary);
  }

  .project-status.status-paused {
    background: var(--accent-warning);
    color: var(--bg-primary);
  }

  .project-status.status-completed {
    background: var(--accent-info);
    color: var(--bg-primary);
  }

  .project-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .dropdown-item.active .project-meta {
    color: var(--bg-secondary);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--border-primary);
    margin: 0.5rem 0;
  }

  .status-section {
    display: flex;
    align-items: center;
  }

  .header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    padding: 0.5rem 2rem;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .header p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.875rem;
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
    .topbar {
      padding: 0.5rem 1rem;
    }
    
    .topbar-content {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .logo-section h1 {
      font-size: 1.25rem;
    }
    
    .project-dropdown {
      min-width: auto;
      width: 100%;
    }
    
    .project-selector {
      min-width: auto;
      width: 100%;
    }
    
    .status-section {
      width: 100%;
      justify-content: center;
    }
    
    .header {
      padding: 0.5rem 1rem;
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