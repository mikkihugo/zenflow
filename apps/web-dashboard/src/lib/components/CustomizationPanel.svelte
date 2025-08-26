<script lang="ts">
import {
	availableWidgets,
	customizationMode,
	dashboardLayout,
	dragDropManager,
	type Widget,
} from "../drag-drop";
import { notifyError, notifyInfo, notifySuccess } from "../notifications";

export let isOpen = false;

const availableWidgetsList: Widget[] = availableWidgets;

// Subscribe to layout changes
let layout: any;
dashboardLayout.subscribe((value) => {
	layout = value;
});

function _toggleCustomization() {
	isOpen = !isOpen;
	customizationMode.set(isOpen);

	if (isOpen) {
		notifyInfo("Customization mode enabled - drag widgets to reorder");
	} else {
		notifySuccess("Dashboard customization saved");
	}
}

function _addWidget(widgetId: string) {
	dragDropManager.addWidget(widgetId);
	notifySuccess(
		`Added ${availableWidgetsList.find((w) => w.id === widgetId)?.name} widget`,
	);
}

function _removeWidget(widgetId: string) {
	const widget = layout.widgets.find((w: Widget) => w.id === widgetId);
	dragDropManager.removeWidget(widgetId);
	notifySuccess(`Removed ${widget?.name} widget`);
}

function _toggleWidget(widgetId: string) {
	const widget = layout.widgets.find((w: Widget) => w.id === widgetId);
	dragDropManager.toggleWidget(widgetId);
	notifyInfo(
		`${widget?.enabled ? "Disabled" : "Enabled"} ${widget?.name} widget`,
	);
}

function _resetDashboard() {
	if (confirm("Reset dashboard to default layout? This cannot be undone.")) {
		dragDropManager.resetDashboard();
		notifySuccess("Dashboard reset to default layout");
	}
}

function _exportLayout() {
	try {
		const layoutData = JSON.stringify(layout, null, 2);
		const blob = new Blob([layoutData], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "dashboard-layout.json";
		a.click();

		URL.revokeObjectURL(url);
		notifySuccess("Dashboard layout exported");
	} catch (error) {
		console.error("Failed to export layout:", error);
	}
}

function _importLayout(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];

	if (!file) return;

	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const layoutData = JSON.parse(e.target?.result as string);
			dashboardLayout.set(layoutData);
			notifySuccess("Dashboard layout imported");
		} catch (error) {
			console.error("Failed to import layout:", error);
			notifyError("Failed to import dashboard layout");
		}
	};
	reader.readAsText(file);
}
</script>

<!-- Customization Toggle Button -->
<button 
  class="fixed bottom-4 right-4 btn variant-filled-primary z-20 shadow-lg"
  on:click={toggleCustomization}
  title={isOpen ? 'Exit Customization' : 'Customize Dashboard'}
>
  {#if isOpen}
    <span>✅</span>
    <span class="hidden sm:inline">Save Layout</span>
  {:else}
    <span>🎨</span>
    <span class="hidden sm:inline">Customize</span>
  {/if}
</button>

<!-- Customization Panel -->
{#if isOpen}
  <div 
    class="fixed inset-y-0 right-0 w-full sm:w-80 bg-surface-50-900-token border-l border-surface-300-600-token z-10 shadow-xl"
    transition:slide={{ duration: 300, axis: 'x' }}
  >
    <div class="flex flex-col h-full">
      <!-- Panel Header -->
      <header class="p-4 border-b border-surface-300-600-token bg-surface-100-800-token">
        <div class="flex items-center justify-between">
          <h2 class="h4 text-primary-500">🎨 Dashboard Customization</h2>
          <button 
            class="btn btn-sm variant-ghost-surface" 
            on:click={toggleCustomization}
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-surface-600-300-token mt-1">
          Drag widgets to reorder, toggle visibility, or add new widgets
        </p>
      </header>

      <!-- Panel Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        
        <!-- Layout Controls -->
        <section>
          <h3 class="h5 mb-3">Layout Controls</h3>
          <div class="space-y-2">
            <button 
              class="btn variant-ghost-surface w-full justify-start"
              on:click={resetDashboard}
            >
              <span>🔄</span>
              <span>Reset to Default</span>
            </button>
            <div class="flex gap-2">
              <button 
                class="btn variant-ghost-surface flex-1"
                on:click={exportLayout}
              >
                <span>📁</span>
                <span>Export</span>
              </button>
              <label class="btn variant-ghost-surface flex-1 cursor-pointer">
                <span>📂</span>
                <span>Import</span>
                <input 
                  type="file" 
                  accept=".json"
                  class="hidden"
                  on:change={importLayout}
                />
              </label>
            </div>
          </div>
        </section>

        <!-- Current Widgets -->
        <section>
          <h3 class="h5 mb-3">Current Widgets</h3>
          <div class="space-y-2">
            {#each layout.widgets as widget (widget.id)}
              <div class="flex items-center gap-3 p-2 rounded bg-surface-100-800-token">
                <button
                  class="flex-shrink-0"
                  on:click={() => toggleWidget(widget.id)}
                  title={widget.enabled ? 'Disable widget' : 'Enable widget'}
                >
                  {#if widget.enabled}
                    <span class="text-success-500">👁️</span>
                  {:else}
                    <span class="text-surface-400">👁️‍🗨️</span>
                  {/if}
                </button>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="flex-shrink-0">{widget.icon}</span>
                    <span class="text-sm font-medium truncate">{widget.name}</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-surface-600-300-token">
                    <span class="badge variant-soft-surface text-xs">
                      {widget.size}
                    </span>
                    <span>
                      Row {widget.position.row + 1}, Col {widget.position.col + 1}
                    </span>
                  </div>
                </div>
                
                <button
                  class="flex-shrink-0 text-error-500 hover:text-error-400"
                  on:click={() => removeWidget(widget.id)}
                  title="Remove widget"
                >
                  🗑️
                </button>
              </div>
            {/each}
          </div>
        </section>

        <!-- Available Widgets -->
        <section>
          <h3 class="h5 mb-3">Add Widgets</h3>
          <div class="space-y-2">
            {#each availableWidgetsList as widget (widget.id)}
              <div class="flex items-center gap-3 p-2 rounded bg-surface-50-900-token border border-surface-300-600-token">
                <span class="flex-shrink-0">{widget.icon}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium">{widget.name}</div>
                  <div class="text-xs text-surface-600-300-token">
                    <span class="badge variant-soft-surface text-xs mr-1">
                      {widget.size}
                    </span>
                    {widget.title}
                  </div>
                </div>
                <button
                  class="flex-shrink-0 btn btn-sm variant-filled-primary"
                  on:click={() => addWidget(widget.id)}
                  title="Add widget to dashboard"
                >
                  +
                </button>
              </div>
            {/each}
          </div>
        </section>

        <!-- Widget Sizes Reference -->
        <section>
          <h3 class="h5 mb-3">Widget Sizes</h3>
          <div class="text-xs text-surface-600-300-token space-y-1">
            <div>📐 <strong>Small:</strong> Status cards, metrics</div>
            <div>📊 <strong>Medium:</strong> Charts, lists</div>
            <div>📈 <strong>Large:</strong> Complex charts, tables</div>
          </div>
        </section>

        <!-- Tips -->
        <section class="bg-primary-500/10 rounded p-3">
          <h3 class="h6 text-primary-500 mb-2">💡 Tips</h3>
          <ul class="text-xs text-surface-600-300-token space-y-1">
            <li>• Drag widgets by their title bar to reorder</li>
            <li>• Toggle eye icon to show/hide widgets</li>
            <li>• Use export/import to share layouts</li>
            <li>• Reset removes all customizations</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
{/if}

<!-- Overlay -->
{#if isOpen}
  <div 
    class="fixed inset-0 bg-surface-900/50 z-5 sm:hidden" 
    on:click={toggleCustomization}
    transition:slide={{ duration: 300 }}
  ></div>
{/if}

<style>
  :global(.dragging) {
    opacity: 0.5;
    transform: rotate(2deg) scale(0.95);
  }
  
  :global(.drop-zone-active) {
    border: 2px dashed rgb(var(--color-primary-500));
    background: rgb(var(--color-primary-500) / 0.1);
  }
  
  :global(.drag-over) {
    border-color: rgb(var(--color-success-500));
    background: rgb(var(--color-success-500) / 0.2);
  }
</style>