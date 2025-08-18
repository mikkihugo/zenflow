/**
 * Drag and drop utilities for dashboard customization
 * Provides widget reordering and layout management
 */

import { writable } from 'svelte/store';

export interface Widget {
  id: string;
  name: string;
  component: string;
  title: string;
  icon: string;
  size: 'small' | 'medium' | 'large';
  position: { row: number; col: number };
  enabled: boolean;
}

export interface DashboardLayout {
  widgets: Widget[];
  columns: number;
  rows: number;
}

/**
 * Default dashboard widgets configuration
 */
export const defaultWidgets: Widget[] = [
  {
    id: 'system-health',
    name: 'System Health',
    component: 'SystemHealthWidget',
    title: '⚡ System Health',
    icon: '⚡',
    size: 'small',
    position: { row: 0, col: 0 },
    enabled: true
  },
  {
    id: 'active-agents',
    name: 'Active Agents',
    component: 'ActiveAgentsWidget',
    title: '🤖 Active Agents',
    icon: '🤖',
    size: 'small',
    position: { row: 0, col: 1 },
    enabled: true
  },
  {
    id: 'performance',
    name: 'Performance',
    component: 'PerformanceWidget',
    title: '📊 Performance',
    icon: '📊',
    size: 'small',
    position: { row: 0, col: 2 },
    enabled: true
  },
  {
    id: 'quick-stats',
    name: 'Quick Stats',
    component: 'QuickStatsWidget',
    title: '📈 Quick Stats',
    icon: '📈',
    size: 'small',
    position: { row: 0, col: 3 },
    enabled: true
  },
  {
    id: 'realtime-chart',
    name: 'Real-time Metrics',
    component: 'RealtimeChartWidget',
    title: '📈 Real-time Metrics',
    icon: '📈',
    size: 'large',
    position: { row: 1, col: 0 },
    enabled: true
  },
  {
    id: 'agent-chart',
    name: 'Agent Distribution',
    component: 'AgentChartWidget',
    title: '🤖 Agent Distribution',
    icon: '🤖',
    size: 'large',
    position: { row: 1, col: 1 },
    enabled: true
  },
  {
    id: 'recent-tasks',
    name: 'Recent Tasks',
    component: 'RecentTasksWidget',
    title: '✅ Recent Tasks',
    icon: '✅',
    size: 'large',
    position: { row: 2, col: 0 },
    enabled: true
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    component: 'QuickActionsWidget',
    title: '⚡ Quick Actions',
    icon: '⚡',
    size: 'large',
    position: { row: 3, col: 0 },
    enabled: true
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    component: 'AIInsightsWidget',
    title: '🤖 AI Insights',
    icon: '🤖',
    size: 'large',
    position: { row: 2, col: 1 },
    enabled: true
  }
];

/**
 * Dashboard layout store
 */
export const dashboardLayout = writable<DashboardLayout>({
  widgets: [...defaultWidgets],
  columns: 4,
  rows: 4
});

/**
 * Widget being dragged store
 */
export const draggedWidget = writable<Widget | null>(null);

/**
 * Customization mode store
 */
export const customizationMode = writable<boolean>(false);

/**
 * Available widget types for adding
 */
export const availableWidgets: Widget[] = [
  {
    id: 'websocket-status',
    name: 'WebSocket Status',
    component: 'WebSocketStatusWidget',
    title: '📡 Connection Status',
    icon: '📡',
    size: 'small',
    position: { row: 0, col: 0 },
    enabled: false
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    component: 'MemoryUsageWidget',
    title: '💾 Memory Usage',
    icon: '💾',
    size: 'medium',
    position: { row: 0, col: 0 },
    enabled: false
  },
  {
    id: 'task-queue',
    name: 'Task Queue',
    component: 'TaskQueueWidget',
    title: '📝 Task Queue',
    icon: '📝',
    size: 'medium',
    position: { row: 0, col: 0 },
    enabled: false
  },
  {
    id: 'agent-logs',
    name: 'Agent Logs',
    component: 'AgentLogsWidget',
    title: '📋 Agent Logs',
    icon: '📋',
    size: 'large',
    position: { row: 0, col: 0 },
    enabled: false
  },
  {
    id: 'ai-recommendations',
    name: 'AI Recommendations',
    component: 'AIInsightsWidget',
    title: '🎯 Smart Recommendations',
    icon: '🎯',
    size: 'large',
    position: { row: 0, col: 0 },
    enabled: false
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    component: 'PredictiveAnalyticsWidget',
    title: '🔮 Predictive Insights',
    icon: '🔮',
    size: 'large',
    position: { row: 0, col: 0 },
    enabled: false
  }
];

/**
 * Drag and drop event handlers
 */
export class DragDropManager {
  private dropZones = new Map<string, HTMLElement>();
  private dragPreview: HTMLElement | null = null;

  /**
   * Register a drop zone
   */
  registerDropZone(id: string, element: HTMLElement): void {
    this.dropZones.set(id, element);
    
    element.addEventListener('dragover', this.handleDragOver.bind(this));
    element.addEventListener('drop', this.handleDrop.bind(this));
    element.addEventListener('dragenter', this.handleDragEnter.bind(this));
    element.addEventListener('dragleave', this.handleDragLeave.bind(this));
  }

  /**
   * Unregister a drop zone
   */
  unregisterDropZone(id: string): void {
    const element = this.dropZones.get(id);
    if (element) {
      element.removeEventListener('dragover', this.handleDragOver.bind(this));
      element.removeEventListener('drop', this.handleDrop.bind(this));
      element.removeEventListener('dragenter', this.handleDragEnter.bind(this));
      element.removeEventListener('dragleave', this.handleDragLeave.bind(this));
      this.dropZones.delete(id);
    }
  }

  /**
   * Start dragging a widget
   */
  startDrag(widget: Widget, element: HTMLElement, event: DragEvent): void {
    draggedWidget.set(widget);
    
    // Create drag preview
    this.createDragPreview(widget, element);
    
    // Set drag data
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(widget));
      event.dataTransfer.effectAllowed = 'move';
    }
    
    // Add dragging class
    element.classList.add('dragging');
    
    // Highlight valid drop zones
    this.highlightDropZones(true);
  }

  /**
   * End dragging
   */
  endDrag(element: HTMLElement): void {
    draggedWidget.set(null);
    
    // Remove drag preview
    if (this.dragPreview) {
      document.body.removeChild(this.dragPreview);
      this.dragPreview = null;
    }
    
    // Remove dragging class
    element.classList.remove('dragging');
    
    // Remove drop zone highlighting
    this.highlightDropZones(false);
  }

  /**
   * Handle drag over event
   */
  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Handle drag enter event
   */
  private handleDragEnter(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('drag-over');
  }

  /**
   * Handle drag leave event
   */
  private handleDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  /**
   * Handle drop event
   */
  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('drag-over');
    
    if (!event.dataTransfer) return;
    
    try {
      const widgetData = JSON.parse(event.dataTransfer.getData('application/json')) as Widget;
      const dropZoneId = dropZone.dataset.dropZone;
      
      if (dropZoneId) {
        this.moveWidget(widgetData.id, dropZoneId);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  }

  /**
   * Create drag preview element
   */
  private createDragPreview(widget: Widget, sourceElement: HTMLElement): void {
    this.dragPreview = sourceElement.cloneNode(true) as HTMLElement;
    this.dragPreview.style.position = 'fixed';
    this.dragPreview.style.top = '-1000px';
    this.dragPreview.style.left = '-1000px';
    this.dragPreview.style.zIndex = '1000';
    this.dragPreview.style.opacity = '0.8';
    this.dragPreview.style.pointerEvents = 'none';
    this.dragPreview.style.transform = 'rotate(5deg)';
    
    document.body.appendChild(this.dragPreview);
  }

  /**
   * Highlight or unhighlight drop zones
   */
  private highlightDropZones(highlight: boolean): void {
    this.dropZones.forEach(element => {
      if (highlight) {
        element.classList.add('drop-zone-active');
      } else {
        element.classList.remove('drop-zone-active');
      }
    });
  }

  /**
   * Move widget to new position
   */
  private moveWidget(widgetId: string, dropZoneId: string): void {
    dashboardLayout.update(layout => {
      const widget = layout.widgets.find(w => w.id === widgetId);
      if (widget) {
        // Parse drop zone position
        const [row, col] = dropZoneId.split('-').slice(1).map(Number);
        widget.position = { row, col };
        
        // Save to localStorage
        this.saveDashboardLayout(layout);
      }
      return layout;
    });
  }

  /**
   * Add widget to dashboard
   */
  addWidget(widgetId: string): void {
    const availableWidget = availableWidgets.find(w => w.id === widgetId);
    if (!availableWidget) return;

    dashboardLayout.update(layout => {
      // Find first available position
      const position = this.findAvailablePosition(layout);
      
      const newWidget: Widget = {
        ...availableWidget,
        id: `${widgetId}-${Date.now()}`,
        position,
        enabled: true
      };
      
      layout.widgets.push(newWidget);
      this.saveDashboardLayout(layout);
      return layout;
    });
  }

  /**
   * Remove widget from dashboard
   */
  removeWidget(widgetId: string): void {
    dashboardLayout.update(layout => {
      layout.widgets = layout.widgets.filter(w => w.id !== widgetId);
      this.saveDashboardLayout(layout);
      return layout;
    });
  }

  /**
   * Toggle widget enabled state
   */
  toggleWidget(widgetId: string): void {
    dashboardLayout.update(layout => {
      const widget = layout.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.enabled = !widget.enabled;
        this.saveDashboardLayout(layout);
      }
      return layout;
    });
  }

  /**
   * Reset dashboard to default layout
   */
  resetDashboard(): void {
    dashboardLayout.set({
      widgets: [...defaultWidgets],
      columns: 4,
      rows: 4
    });
    this.saveDashboardLayout({
      widgets: [...defaultWidgets],
      columns: 4,
      rows: 4
    });
  }

  /**
   * Find available position for new widget
   */
  private findAvailablePosition(layout: DashboardLayout): { row: number; col: number } {
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.columns; col++) {
        const occupied = layout.widgets.some(w => 
          w.enabled && w.position.row === row && w.position.col === col
        );
        if (!occupied) {
          return { row, col };
        }
      }
    }
    
    // If no available position, expand grid
    return { row: layout.rows, col: 0 };
  }

  /**
   * Save dashboard layout to localStorage
   */
  private saveDashboardLayout(layout: DashboardLayout): void {
    try {
      localStorage.setItem('dashboard-layout', JSON.stringify(layout));
    } catch (error) {
      console.warn('Failed to save dashboard layout:', error);
    }
  }

  /**
   * Load dashboard layout from localStorage
   */
  loadDashboardLayout(): void {
    try {
      const saved = localStorage.getItem('dashboard-layout');
      if (saved) {
        const layout = JSON.parse(saved) as DashboardLayout;
        dashboardLayout.set(layout);
      }
    } catch (error) {
      console.warn('Failed to load dashboard layout:', error);
      this.resetDashboard();
    }
  }
}

/**
 * Global drag-drop manager instance
 */
export const dragDropManager = new DragDropManager();

/**
 * Widget size configurations
 */
export const widgetSizes = {
  small: {
    minWidth: '200px',
    minHeight: '120px',
    gridColumns: 1,
    gridRows: 1
  },
  medium: {
    minWidth: '300px',
    minHeight: '200px',
    gridColumns: 2,
    gridRows: 1
  },
  large: {
    minWidth: '400px',
    minHeight: '300px',
    gridColumns: 2,
    gridRows: 2
  }
};

/**
 * CSS classes for drag and drop states
 */
export const dragDropClasses = {
  dragging: 'opacity-50 transform rotate-2 scale-95',
  dropZone: 'border-2 border-dashed border-transparent transition-colors',
  dropZoneActive: 'border-primary-500 bg-primary-500/10',
  dragOver: 'border-success-500 bg-success-500/20'
};