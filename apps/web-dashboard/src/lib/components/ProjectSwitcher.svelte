<script lang="ts">
import { onMount } from "svelte";
import { writable } from "svelte/store";
import { apiClient } from "../api";

// Types
interface Project {
	id: string;
	name: string;
	path: string;
	lastAccessed: string;
	isCurrent: boolean;
	status: "active" | "inactive";
}

interface ProjectSwitchResult {
	success: boolean;
	projectId: string;
	projectName: string;
	projectPath: string;
	previousProject?: string;
	switchedAt: string;
	initializationTime: number;
}

// State
export let showDropdown = false;

const projects = writable<Project[]>([]);
const currentProject = writable<Project | null>(null);
const loading = writable(false);
const switching = writable(false);
const error = writable<string | null>(null);

let dropdownElement: HTMLElement;
let switchingProjectId: string | null = null;

// Reactive variables
$: currentProjectName = $currentProject?.name || "No Project";
$: recentProjects = $projects.slice(0, 5); // Show only 5 most recent

onMount(() => {
	loadProjects();
	loadCurrentProject();

	// Setup keyboard shortcuts
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.shiftKey && e.key === "P") {
			e.preventDefault();
			showDropdown = !showDropdown;
		}

		if (e.key === "Escape" && showDropdown) {
			showDropdown = false;
		}
	};

	document.addEventListener("keydown", handleKeydown);

	return () => {
		document.removeEventListener("keydown", handleKeydown);
	};
});

async function loadProjects() {
	try {
		loading.set(true);
		error.set(null);

		const projectsData = await apiClient.getProjects();

		projects.set(projectsData || []);
	} catch (err) {
		console.error("Failed to load projects:", err);
		error.set("Failed to load projects");
	} finally {
		loading.set(false);
	}
}

async function loadCurrentProject() {
	try {
		const project = await apiClient.getCurrentProject();

		currentProject.set({
			...project,
			isCurrent: true,
			status: "active",
		});
	} catch (err) {
		console.error("Failed to load current project:", err);
	}
}

async function _switchToProject(projectId: string) {
	if (switchingProjectId || projectId === $currentProject?.id) {
		return;
	}

	try {
		switching.set(true);
		switchingProjectId = projectId;
		error.set(null);

		// Find project name for UI feedback
		const project = $projects.find((p) => p.id === projectId);
		const projectName = project?.name || projectId;

		// Show switching notification
		showSwitchingNotification(projectName);

		const result: ProjectSwitchResult =
			await apiClient.switchToProject(projectId);

		if (result.success) {
			// Update current project
			currentProject.set({
				id: result.projectId,
				name: result.projectName,
				path: result.projectPath,
				lastAccessed: result.switchedAt,
				isCurrent: true,
				status: "active",
			});

			// Reload projects to update last accessed times
			await loadProjects();

			// Show success notification
			showSuccessNotification(result);

			// Close dropdown
			showDropdown = false;

			// Reload the page to reinitialize with new project
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} else {
			throw new Error("Project switch failed");
		}
	} catch (err) {
		console.error("Failed to switch project:", err);
		const errorMessage = err instanceof Error ? err.message : "Unknown error";
		error.set(`Failed to switch to project: ${errorMessage}`);
		showErrorNotification(errorMessage);
	} finally {
		switching.set(false);
		switchingProjectId = null;
	}
}

function showSwitchingNotification(projectName: string) {
	// This would integrate with a notification system
	console.info(`Switching to project: ${projectName}...`);
}

function showSuccessNotification(result: ProjectSwitchResult) {
	const duration = Math.round(result.initializationTime);
	console.info(
		`Successfully switched to ${result.projectName} in ${duration}ms`,
	);
}

function showErrorNotification(errorMessage: string) {
	console.error(`Project switch failed: ${errorMessage}`);
}

function _toggleDropdown() {
	showDropdown = !showDropdown;
}

function handleClickOutside(event: Event) {
	if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
		showDropdown = false;
	}
}

function _formatLastAccessed(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return "Today";
	} else if (diffDays === 1) {
		return "Yesterday";
	} else if (diffDays < 7) {
		return `${diffDays} days ago`;
	} else {
		return date.toLocaleDateString();
	}
}

// Close dropdown when clicking outside
$: if (showDropdown) {
	setTimeout(() => {
		document.addEventListener("click", handleClickOutside);
	});
} else {
	document.removeEventListener("click", handleClickOutside);
}
</script>

<svelte:window on:keydown />

<div class="project-switcher" bind:this={dropdownElement}>
  <!-- Current Project Display -->
  <button 
    class="current-project-button"
    class:switching={$switching}
    on:click={toggleDropdown}
    disabled={$switching}
    title="Switch Project (Ctrl+Shift+P)"
  >
    <div class="project-info">
      <div class="project-name">
        {currentProjectName}
      </div>
      <div class="project-status">
        {#if $switching}
          <span class="status-indicator switching">●</span>
          Switching...
        {:else if $currentProject}
          <span class="status-indicator active">●</span>
          Active
        {:else}
          <span class="status-indicator inactive">●</span>
          No Project
        {/if}
      </div>
    </div>
    
    <svg 
      class="dropdown-arrow"
      class:rotated={showDropdown}
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M3 4.5L6 7.5L9 4.5" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  </button>

  <!-- Dropdown Menu -->
  {#if showDropdown}
    <div class="dropdown-menu">
      <div class="dropdown-header">
        <h3>Switch Project</h3>
        <button 
          class="refresh-button"
          on:click={loadProjects}
          disabled={$loading}
          title="Refresh Projects"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M13.65 2.35C12.2 0.9 10.2 0 8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {#if $loading}
        <div class="loading-state">
          <div class="spinner"></div>
          Loading projects...
        </div>
      {:else if $error}
        <div class="error-state">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM9 12H7V10H9V12ZM9 8H7V4H9V8Z" 
              fill="currentColor"
            />
          </svg>
          {$error}
        </div>
      {:else if recentProjects.length === 0}
        <div class="empty-state">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linejoin="round"
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linejoin="round"
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linejoin="round"
            />
          </svg>
          No projects found
        </div>
      {:else}
        <div class="projects-list">
          {#each recentProjects as project (project.id)}
            <button
              class="project-item"
              class:current={project.isCurrent}
              class:switching={switchingProjectId === project.id}
              on:click={() => switchToProject(project.id)}
              disabled={project.isCurrent || $switching}
            >
              <div class="project-main">
                <div class="project-name">{project.name}</div>
                <div class="project-path">{project.path}</div>
              </div>
              
              <div class="project-meta">
                <span class="last-accessed">
                  {formatLastAccessed(project.lastAccessed)}
                </span>
                <span class="status-indicator" class:active={project.isCurrent}>
                  {#if switchingProjectId === project.id}
                    <div class="mini-spinner"></div>
                  {:else if project.isCurrent}
                    ✓
                  {:else}
                    ○
                  {/if}
                </span>
              </div>
            </button>
          {/each}
        </div>
      {/if}

      <div class="dropdown-footer">
        <div class="footer-content">
          <div class="keyboard-hint">
            Ctrl+Shift+P to toggle
          </div>
          
          <!-- Project Mode Manager Integration -->
          {#if $currentProject}
            <div class="mode-manager-container">
              <ProjectModeManager 
                projectId={$currentProject.id} 
                showModeManager={false}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .project-switcher {
    position: relative;
    display: inline-block;
  }

  .current-project-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-primary, #1a1a1a);
    border: 1px solid var(--border-color, #333);
    border-radius: 8px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200px;
  }

  .current-project-button:hover {
    background: var(--bg-secondary, #2a2a2a);
    border-color: var(--border-hover, #555);
  }

  .current-project-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .current-project-button.switching {
    border-color: var(--accent-color, #007acc);
  }

  .project-info {
    flex: 1;
    text-align: left;
  }

  .project-name {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.2;
  }

  .project-status {
    font-size: 12px;
    color: var(--text-secondary, #888);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }

  .status-indicator {
    display: inline-block;
    font-size: 8px;
    line-height: 1;
  }

  .status-indicator.active {
    color: var(--success-color, #4CAF50);
  }

  .status-indicator.switching {
    color: var(--accent-color, #007acc);
    animation: pulse 1s infinite;
  }

  .status-indicator.inactive {
    color: var(--error-color, #f44336);
  }

  .dropdown-arrow {
    transition: transform 0.2s ease;
    color: var(--text-secondary, #888);
  }

  .dropdown-arrow.rotated {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--bg-primary, #1a1a1a);
    border: 1px solid var(--border-color, #333);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid var(--border-color, #333);
  }

  .dropdown-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .refresh-button {
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .refresh-button:hover {
    background: var(--bg-secondary, #2a2a2a);
    color: var(--text-primary, #fff);
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    color: var(--text-secondary, #888);
    font-size: 14px;
  }

  .error-state {
    color: var(--error-color, #f44336);
  }

  .projects-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .project-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-color, #333);
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .project-item:hover {
    background: var(--bg-secondary, #2a2a2a);
  }

  .project-item:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .project-item.current {
    background: var(--accent-color-bg, rgba(0, 122, 204, 0.1));
    border-color: var(--accent-color, #007acc);
  }

  .project-item.switching {
    background: var(--accent-color-bg, rgba(0, 122, 204, 0.2));
  }

  .project-main {
    flex: 1;
  }

  .project-item .project-name {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.2;
  }

  .project-path {
    font-size: 12px;
    color: var(--text-secondary, #888);
    margin-top: 2px;
    font-family: monospace;
  }

  .project-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary, #888);
  }

  .last-accessed {
    white-space: nowrap;
  }

  .dropdown-footer {
    border-top: 1px solid var(--border-color, #333);
    background: var(--bg-secondary, rgba(42, 42, 42, 0.5));
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    gap: 12px;
  }

  .keyboard-hint {
    font-size: 11px;
    color: var(--text-secondary, #888);
    flex-shrink: 0;
  }

  .mode-manager-container {
    flex-shrink: 0;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color, #333);
    border-top: 2px solid var(--accent-color, #007acc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .mini-spinner {
    width: 12px;
    height: 12px;
    border: 1px solid var(--border-color, #333);
    border-top: 1px solid var(--accent-color, #007acc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>