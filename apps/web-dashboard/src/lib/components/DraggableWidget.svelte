<script lang="ts">
import { onMount } from "svelte";
import { dragDropManager, type Widget } from "../drag-drop";

export let widget: Widget;
export const isDragMode: boolean = false;

let elementRef: HTMLElement;
let _isDragging = false;

onMount(() => {
	if (elementRef) {
		// Register as drag source
		elementRef.draggable = isDragMode;

		if (isDragMode) {
			elementRef.addEventListener("dragstart", handleDragStart);
			elementRef.addEventListener("dragend", handleDragEnd);
		}
	}

	return () => {
		if (elementRef) {
			elementRef.removeEventListener("dragstart", handleDragStart);
			elementRef.removeEventListener("dragend", handleDragEnd);
		}
	};
});

$: {
	if (elementRef) {
		elementRef.draggable = isDragMode;
	}
}

function handleDragStart(event: DragEvent) {
	_isDragging = true;
	dragDropManager.startDrag(widget, elementRef, event);
}

function handleDragEnd(_event: DragEvent) {
	_isDragging = false;
	dragDropManager.endDrag(elementRef);
}
</script>

<div 
  bind:this={elementRef}
  class="widget-wrapper {isDragMode ? 'drag-mode' : ''} {isDragging ? 'dragging' : ''}"
  class:cursor-move={isDragMode}
  class:opacity-50={isDragging}
  data-widget-id={widget.id}
>
  <!-- Widget title bar (visible in drag mode) -->
  {#if isDragMode}
    <div class="widget-title-bar bg-surface-100-800-token p-2 border-b border-surface-300-600-token">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 select-none">
          <span class="drag-handle cursor-move">⋮⋮</span>
          <span class="text-sm font-medium">{widget.icon} {widget.name}</span>
        </div>
        <div class="badge variant-soft-surface text-xs">
          {widget.size}
        </div>
      </div>
    </div>
  {/if}

  <!-- Widget content -->
  <div class="widget-content {isDragMode ? 'p-2' : ''}">
    <slot />
  </div>
</div>

<style>
  .widget-wrapper {
    transition: all 0.2s ease;
  }

  .widget-wrapper.drag-mode {
    border: 2px dashed transparent;
    border-radius: 0.5rem;
  }

  .widget-wrapper.drag-mode:hover {
    border-color: rgb(var(--color-primary-500));
    background: rgb(var(--color-primary-500) / 0.05);
  }

  .widget-wrapper.dragging {
    transform: rotate(2deg) scale(0.95);
    z-index: 1000;
  }

  .widget-title-bar {
    border-radius: 0.5rem 0.5rem 0 0;
  }
</style>