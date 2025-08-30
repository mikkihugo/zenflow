/**
 * @fileoverview Vitest Setup File
 * 
 * Global test setup for the server package.
 * Sets up mocks and test utilities.
 */

import { vi } from 'vitest';

// Mock TaskMaster service
vi.mock('../src/services/api/taskmaster', () => ({
  getTaskMasterService: vi.fn(() => Promise.resolve({
    initialize: vi.fn(() => Promise.resolve()),
    shutdown: vi.fn(() => Promise.resolve()),
    getStatus: vi.fn(() => 'ready'),
    createTask: vi.fn((data) => Promise.resolve({ id: 'test-task', ...data })),
    moveTask: vi.fn(() => Promise.resolve(true)),
    getFlowMetrics: vi.fn(() => Promise.resolve({
      cycleTime: 1,
      leadTime: 2,
      throughput: 3,
      wipCount: 4,
      blockedTasks: 0,
      completedTasks: 5,
    })),
    createPIPlanningEvent: vi.fn((data) => Promise.resolve({ success: true, id: 'test-event', ...data })),
  })),
}));