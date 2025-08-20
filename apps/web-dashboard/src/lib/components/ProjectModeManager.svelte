<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { apiClient } from '../api';
  
  // Props
  export let projectId: string;
  export let showModeManager = false;
  
  // Types
  interface ProjectMode {
    mode: string;
    capabilities: any;
    schemaVersion: string;
    description: string;
    settings: any;
    migration: {
      upgradeableTo: string[];
      downgradeableTo: string[];
      migrationRequired: boolean;
    };
  }

  interface ModeUpgradeResult {
    success: boolean;
    newSchemaVersion: string;
    migrationLog: string[];
    warnings: string[];
  }

  // State
  const currentMode = writable<string>('basic');
  const availableModes = writable<string[]>([]);
  const allModes = writable<ProjectMode[]>([]);
  const upgrading = writable(false);
  const loading = writable(false);
  const error = writable<string | null>(null);
  const upgradeProgress = writable<string[]>([]);

  let selectedTargetMode = '';
  let upgradeOptions = {
    preserveData: true,
    backupBeforeMigration: true,
    validateAfterMigration: true
  };

  // Reactive variables
  $: currentModeData = $allModes.find(m => m.mode === $currentMode);
  $: upgradableModes = currentModeData?.migration.upgradeableTo || [];
  $: downgradableModes = currentModeData?.migration.downgradeableTo || [];
  $: canUpgrade = upgradableModes.length > 0;
  $: canDowngrade = downgradableModes.length > 0;

  onMount(() => {
    loadProjectModes();
    loadAllModes();
  });

  async function loadProjectModes() {
    try {
      loading.set(true);
      error.set(null);
      
      const response = await apiClient.getProjectModes(projectId);
      
      currentMode.set(response.currentMode);
      availableModes.set(response.availableModes);
      
    } catch (err) {
      console.error('Failed to load project modes:', err);
      error.set('Failed to load project modes');
    } finally {
      loading.set(false);
    }
  }

  async function loadAllModes() {
    try {
      const response = await apiClient.getAllProjectModes();
      allModes.set(response.modes);
    } catch (err) {
      console.error('Failed to load all modes:', err);
    }
  }

  async function upgradeMode() {
    if (!selectedTargetMode || $upgrading) {
      return;
    }

    try {
      upgrading.set(true);
      upgradeProgress.set(['Starting mode upgrade...']);
      error.set(null);

      const result: ModeUpgradeResult = await apiClient.upgradeProjectMode(projectId, {
        toMode: selectedTargetMode,
        ...upgradeOptions
      });

      if (result.success) {
        upgradeProgress.set([
          ...result.migrationLog,
          `✅ Successfully upgraded to ${selectedTargetMode}`,
          `New schema version: ${result.newSchemaVersion}`
        ]);
        
        // Reload project modes to reflect the change
        await loadProjectModes();
        
        // Show success notification
        showUpgradeSuccess(selectedTargetMode, result);
        
        // Reset selection
        selectedTargetMode = '';
      } else {
        throw new Error('Mode upgrade failed');
      }

    } catch (err) {
      console.error('Mode upgrade failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      error.set(`Mode upgrade failed: ${errorMessage}`);
      upgradeProgress.set([
        ...$upgradeProgress,
        `❌ Upgrade failed: ${errorMessage}`
      ]);
    } finally {
      upgrading.set(false);
    }
  }

  function showUpgradeSuccess(targetMode: string, result: ModeUpgradeResult) {
    // This would integrate with a notification system
    console.info(`Successfully upgraded to ${targetMode}`, result);
  }

  function getModeIcon(mode: string): string {
    switch (mode) {
      case 'basic': return '📋';
      case 'agile': return '🚀';
      case 'safe': return '🏢';
      case 'kanban': return '📊';
      case 'custom': return '⚙️';
      default: return '❓';
    }
  }

  function getModeColor(mode: string): string {
    switch (mode) {
      case 'basic': return '#6B7280';
      case 'agile': return '#3B82F6';
      case 'safe': return '#8B5CF6';
      case 'kanban': return '#10B981';
      case 'custom': return '#F59E0B';
      default: return '#6B7280';
    }
  }

  function toggleModeManager() {
    showModeManager = !showModeManager;
  }

  function clearUpgradeProgress() {
    upgradeProgress.set([]);
    error.set(null);
  }
</script>

<div class="project-mode-manager">
  <!-- Toggle Button -->
  <button 
    class="mode-toggle-button"
    on:click={toggleModeManager}
    title="Manage Project Mode"
  >
    <span class="mode-icon">{getModeIcon($currentMode)}</span>
    <span class="mode-name">{$currentMode.toUpperCase()}</span>
    <svg 
      class="dropdown-arrow"
      class:rotated={showModeManager}
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none"
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

  <!-- Mode Management Panel -->
  {#if showModeManager}
    <div class="mode-panel">
      <div class="panel-header">
        <h3>Project Mode</h3>
        <button 
          class="close-button"
          on:click={toggleModeManager}
          title="Close"
        >
          ×
        </button>
      </div>

      {#if $loading}
        <div class="loading-state">
          <div class="spinner"></div>
          Loading project modes...
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
      {:else}
        <!-- Current Mode Display -->
        <div class="current-mode">
          <div class="mode-badge" style="--mode-color: {getModeColor($currentMode)}">
            <span class="mode-icon">{getModeIcon($currentMode)}</span>
            <div class="mode-info">
              <div class="mode-name">{$currentMode.toUpperCase()}</div>
              <div class="mode-description">
                {currentModeData?.description || 'Current project mode'}
              </div>
            </div>
          </div>
          
          {#if currentModeData}
            <div class="mode-details">
              <div class="detail-item">
                <span class="label">Schema Version:</span>
                <span class="value">{currentModeData.schemaVersion}</span>
              </div>
              <div class="detail-item">
                <span class="label">Migration Required:</span>
                <span class="value">{currentModeData.migration.migrationRequired ? 'Yes' : 'No'}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Mode Upgrade Section -->
        {#if canUpgrade && !$upgrading}
          <div class="upgrade-section">
            <h4>Available Upgrades</h4>
            
            <div class="mode-selector">
              <label for="target-mode">Upgrade to:</label>
              <select 
                id="target-mode" 
                bind:value={selectedTargetMode}
                class="mode-select"
              >
                <option value="">Select a mode...</option>
                {#each upgradableModes as mode}
                  {@const modeData = $allModes.find(m => m.mode === mode)}
                  <option value={mode}>
                    {getModeIcon(mode)} {mode.toUpperCase()} - {modeData?.description || ''}
                  </option>
                {/each}
              </select>
            </div>

            {#if selectedTargetMode}
              <div class="upgrade-options">
                <h5>Upgrade Options</h5>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    bind:checked={upgradeOptions.preserveData}
                  />
                  Preserve existing data
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    bind:checked={upgradeOptions.backupBeforeMigration}
                  />
                  Create backup before migration
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    bind:checked={upgradeOptions.validateAfterMigration}
                  />
                  Validate after migration
                </label>
              </div>

              <button 
                class="upgrade-button"
                on:click={upgradeMode}
                disabled={!selectedTargetMode}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path 
                    d="M8 0L11 4H9V8H7V4H5L8 0Z" 
                    fill="currentColor"
                  />
                  <path 
                    d="M2 10V14H14V10H16V14C16 15.1 15.1 16 14 16H2C0.9 16 0 15.1 0 14V10H2Z" 
                    fill="currentColor"
                  />
                </svg>
                Upgrade to {selectedTargetMode.toUpperCase()}
              </button>
            {/if}
          </div>
        {:else if !canUpgrade && !$upgrading}
          <div class="no-upgrades">
            <p>No upgrades available from current mode.</p>
          </div>
        {/if}

        <!-- Upgrade Progress -->
        {#if $upgrading || $upgradeProgress.length > 0}
          <div class="upgrade-progress">
            <div class="progress-header">
              <h4>
                {#if $upgrading}
                  <div class="spinner small"></div>
                  Upgrading...
                {:else}
                  Upgrade Complete
                {/if}
              </h4>
              {#if !$upgrading}
                <button 
                  class="clear-button"
                  on:click={clearUpgradeProgress}
                  title="Clear Progress"
                >
                  Clear
                </button>
              {/if}
            </div>
            
            <div class="progress-log">
              {#each $upgradeProgress as logEntry}
                <div class="log-entry">{logEntry}</div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Available Modes Info -->
        <div class="modes-overview">
          <h4>Available Modes</h4>
          <div class="modes-grid">
            {#each $allModes as mode}
              <div 
                class="mode-card"
                class:current={mode.mode === $currentMode}
                style="--mode-color: {getModeColor(mode.mode)}"
              >
                <div class="card-header">
                  <span class="mode-icon">{getModeIcon(mode.mode)}</span>
                  <span class="mode-name">{mode.mode.toUpperCase()}</span>
                </div>
                <div class="card-description">{mode.description}</div>
                <div class="card-version">v{mode.schemaVersion}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .project-mode-manager {
    position: relative;
    display: inline-block;
  }

  .mode-toggle-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--border-color, #333);
    border-radius: 6px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    font-weight: 500;
  }

  .mode-toggle-button:hover {
    background: var(--bg-tertiary, #3a3a3a);
    border-color: var(--border-hover, #555);
  }

  .mode-icon {
    font-size: 14px;
  }

  .mode-name {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .dropdown-arrow {
    transition: transform 0.2s ease;
    color: var(--text-secondary, #888);
  }

  .dropdown-arrow.rotated {
    transform: rotate(180deg);
  }

  .mode-panel {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    width: 320px;
    background: var(--bg-primary, #1a1a1a);
    border: 1px solid var(--border-color, #333);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-height: 500px;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid var(--border-color, #333);
  }

  .panel-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .close-button {
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: var(--bg-secondary, #2a2a2a);
    color: var(--text-primary, #fff);
  }

  .loading-state,
  .error-state {
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

  .current-mode {
    padding: 12px;
    border-bottom: 1px solid var(--border-color, #333);
  }

  .mode-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--mode-color);
    border-radius: 8px;
  }

  .mode-info {
    flex: 1;
  }

  .mode-badge .mode-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #fff);
    margin-bottom: 2px;
  }

  .mode-description {
    font-size: 12px;
    color: var(--text-secondary, #888);
    line-height: 1.3;
  }

  .mode-details {
    margin-top: 8px;
    font-size: 12px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
  }

  .label {
    color: var(--text-secondary, #888);
  }

  .value {
    color: var(--text-primary, #fff);
    font-weight: 500;
  }

  .upgrade-section {
    padding: 12px;
    border-bottom: 1px solid var(--border-color, #333);
  }

  .upgrade-section h4 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .mode-selector label {
    display: block;
    font-size: 12px;
    color: var(--text-secondary, #888);
    margin-bottom: 4px;
  }

  .mode-select {
    width: 100%;
    padding: 8px;
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--border-color, #333);
    border-radius: 4px;
    color: var(--text-primary, #fff);
    font-size: 12px;
  }

  .upgrade-options {
    margin: 12px 0;
  }

  .upgrade-options h5 {
    margin: 0 0 8px 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary, #888);
    margin-bottom: 4px;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
  }

  .upgrade-button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: var(--accent-color, #007acc);
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .upgrade-button:hover {
    background: var(--accent-color-hover, #005fa3);
  }

  .upgrade-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .no-upgrades {
    padding: 12px;
    text-align: center;
    color: var(--text-secondary, #888);
    font-size: 12px;
  }

  .upgrade-progress {
    padding: 12px;
    border-bottom: 1px solid var(--border-color, #333);
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .progress-header h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .clear-button {
    padding: 4px 8px;
    background: transparent;
    border: 1px solid var(--border-color, #333);
    border-radius: 4px;
    color: var(--text-secondary, #888);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-button:hover {
    background: var(--bg-secondary, #2a2a2a);
    color: var(--text-primary, #fff);
  }

  .progress-log {
    max-height: 120px;
    overflow-y: auto;
    background: var(--bg-tertiary, #0f0f0f);
    border: 1px solid var(--border-color, #333);
    border-radius: 4px;
    padding: 8px;
  }

  .log-entry {
    font-size: 11px;
    font-family: monospace;
    color: var(--text-secondary, #888);
    margin-bottom: 2px;
    line-height: 1.4;
  }

  .modes-overview {
    padding: 12px;
  }

  .modes-overview h4 {
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .modes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .mode-card {
    padding: 8px;
    background: var(--bg-secondary, #2a2a2a);
    border: 1px solid var(--border-color, #333);
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .mode-card.current {
    border-color: var(--mode-color);
    background: rgba(var(--mode-color-rgb, 0, 122, 204), 0.1);
  }

  .mode-card:hover {
    border-color: var(--border-hover, #555);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .card-header .mode-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .card-description {
    font-size: 10px;
    color: var(--text-secondary, #888);
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .card-version {
    font-size: 9px;
    color: var(--text-tertiary, #666);
    font-family: monospace;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color, #333);
    border-top: 2px solid var(--accent-color, #007acc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner.small {
    width: 12px;
    height: 12px;
    border-width: 1.5px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>