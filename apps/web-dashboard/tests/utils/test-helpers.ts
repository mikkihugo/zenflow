/**
 * Comprehensive testing utilities for Claude Code Zen web dashboard
 * Enterprise-grade testing helpers with Vitest integration
 */

import { vi } from 'vitest';
import type { ComponentConstructorOptions } from 'svelte';

// ===== MOCK DATA GENERATORS =====

export const mockAgentId = () => `agent_${Math.random().toString(36).substr(2, 9)}`;
export const mockTaskId = () => `task_${Math.random().toString(36).substr(2, 9)}`;
export const mockUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;

export const mockTimestamp = () => Date.now();

export const mockAgentStatus = (overrides = {}) => ({
  id: mockAgentId(),
  type: 'coordinator',
  status: 'active' as const,
  lastSeen: mockTimestamp(),
  capabilities: ['task-management', 'coordination'],
  metadata: {},
  ...overrides,
});

export const mockTaskDefinition = (overrides = {}) => ({
  id: mockTaskId(),
  title: 'Test Task',
  description: 'A test task for validation',
  assignedAgentId: mockAgentId(),
  status: 'pending' as const,
  createdAt: mockTimestamp(),
  updatedAt: mockTimestamp(),
  priority: 'medium' as const,
  metadata: {},
  ...overrides,
});

export const mockSystemHealth = (overrides = {}) => ({
  status: 'healthy' as const,
  components: {
    database: 'healthy' as const,
    eventBus: 'healthy' as const,
    neural: 'healthy' as const,
    agents: 'healthy' as const,
  },
  lastCheck: mockTimestamp(),
  uptime: 86400000, // 24 hours in ms
  ...overrides,
});

// ===== API MOCKING UTILITIES =====

export const mockFetch = (responseData: any, status = 200) => vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
    })
  );

export const mockFailedFetch = (status = 500, message = 'Server Error') => vi.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      statusText: message,
      json: () => Promise.reject(new Error('Failed to parse JSON')),
      text: () => Promise.resolve(message),
    })
  );

export const mockNetworkError = () => vi.fn(() => Promise.reject(new Error('Network Error')));

// ===== WEBSOCKET MOCKING =====

export class MockWebSocket {
  public readyState = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  private listeners: Map<string, Function[]> = new Map();

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
      this.dispatchEvent('open', new Event('open'));
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Mock echo for testing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
      this.dispatchEvent('message', new MessageEvent('message', { data }));
    }, 5);
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
    this.dispatchEvent('close', new CloseEvent('close', { code, reason }));
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(type: string, event: Event) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      for (const listener of listeners) listener(event);
    }
  }
}

// ===== SVELTE COMPONENT TESTING UTILITIES =====

export interface RenderOptions {
  props?: Record<string, any>;
  context?: Map<any, any>;
}

export interface RenderResult {
  component: any;
  container: HTMLElement;
  rerender: (props: Record<string, any>) => void;
  unmount: () => void;
}

export const render = (
  Component: any,
  options: RenderOptions = {}
): RenderResult => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const componentOptions: ComponentConstructorOptions<Record<string, any>> = {
    target: container,
    props: options.props || {},
  };

  if (options.context) {
    componentOptions.context = options.context;
  }

  const component = new Component(componentOptions);

  return {
    component,
    container,
    rerender: (props: Record<string, any>) => {
      component.$set(props);
    },
    unmount: () => {
      component.$destroy();
      document.body.removeChild(container);
    },
  };
};

// ===== EVENT TESTING UTILITIES =====

export const fireEvent = {
  click: (element: HTMLElement) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },
  change: (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
  },
  submit: (element: HTMLFormElement) => {
    element.dispatchEvent(new Event('submit', { bubbles: true }));
  },
  keydown: (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  },
  focus: (element: HTMLElement) => {
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
  },
  blur: (element: HTMLElement) => {
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
  },
};

// ===== ACCESSIBILITY TESTING UTILITIES =====

export const checkA11y = {
  hasAriaLabel: (element: HTMLElement): boolean => element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
  
  hasRole: (element: HTMLElement, role?: string): boolean => {
    const elementRole = element.getAttribute('role');
    return role ? elementRole === role : !!elementRole;
  },
  
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  },
  
  hasValidTabIndex: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    return !tabIndex || !isNaN(parseInt(tabIndex, 10));
  },
  
  hasSemanticHTML: (container: HTMLElement): boolean => {
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    return semanticTags.some(tag => container.querySelector(tag));
  },
};

// ===== PERFORMANCE TESTING UTILITIES =====

export const measurePerformance = async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  return {
    result,
    duration: end - start,
  };
};

export const measureRenderTime = (Component: any, props = {}) => measurePerformance(() => {
    const { unmount } = render(Component, { props });
    unmount();
  });

// ===== ERROR BOUNDARY TESTING =====

export const triggerError = (component: any, error: Error) => {
  // Simulate component error
  const originalConsoleError = console.error;
  console.error = vi.fn(); // Suppress error logs during testing
  
  try {
    component.$set({ shouldError: true });
    throw error;
  } catch (error_) {
    // Expected error
  } finally {
    console.error = originalConsoleError;
  }
};

// ===== ENTERPRISE TESTING UTILITIES =====

export const mockTaskMasterAPI = {
  requestApproval: vi.fn(() => Promise.resolve({ granted: true, id: 'approval_123' })),
  getTaskStatus: vi.fn(() => Promise.resolve({ status: 'approved', timestamp: mockTimestamp() })),
  submitTask: vi.fn(() => Promise.resolve({ success: true, taskId: mockTaskId() })),
};

export const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
};

export const mockBrainCoordinator = {
  getAgents: vi.fn(() => Promise.resolve([mockAgentStatus()])),
  assignTask: vi.fn(() => Promise.resolve({ success: true })),
  getSystemHealth: vi.fn(() => Promise.resolve(mockSystemHealth())),
};

// ===== CUSTOM MATCHERS =====

export const customMatchers = {
  toBeVisible: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return {
      pass: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
      message: () => `Expected element to be visible`,
    };
  },
  
  toHaveAccessibleName: (element: HTMLElement) => {
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
    const hasTextContent = !!element.textContent?.trim();
    
    return {
      pass: hasAriaLabel || hasAriaLabelledBy || hasTextContent,
      message: () => `Expected element to have an accessible name`,
    };
  },
  
  toBeWithinRange: (actual: number, expected: number, tolerance: number) => {
    const diff = Math.abs(actual - expected);
    return {
      pass: diff <= tolerance,
      message: () => `Expected ${actual} to be within ${tolerance} of ${expected}`,
    };
  },
};

// ===== CLEANUP UTILITIES =====

export const cleanup = () => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear DOM
  document.body.innerHTML = '';
  
  // Reset fetch mock if it exists
  if (global.fetch && vi.isMockFunction(global.fetch)) {
    (global.fetch as any).mockReset();
  }
  
  // Reset WebSocket mock if it exists
  if (global.WebSocket && vi.isMockFunction(global.WebSocket)) {
    (global.WebSocket as any).mockReset();
  }
};

// ===== TEST ENVIRONMENT SETUP =====

export const setupTestEnvironment = () => {
  // Mock global fetch
  global.fetch = mockFetch({});
  
  // Mock WebSocket
  global.WebSocket = MockWebSocket as any;
  
  // Mock performance if not available
  if (!global.performance) {
    global.performance = {
      now: () => Date.now(),
    } as any;
  }
  
  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  
  // Suppress console warnings during tests
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (!args[0]?.includes('A11y:')) {
      originalWarn(...args);
    }
  };
};

// ===== WAIT UTILITIES =====

export const waitFor = async (
  callback: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> => {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await callback()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`waitFor timed out after ${timeout}ms`);
};

export const waitForElement = (selector: string, container = document.body) => waitFor(() => !!container.querySelector(selector));

export const waitForElementToBeRemoved = (selector: string, container = document.body) => waitFor(() => !container.querySelector(selector));