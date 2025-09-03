/**
 * KnowledgeEventBridge tests
 *
 * Note: This project uses an existing testing framework detected at runtime.
 * The tests below are written to be compatible with both Vitest and Jest
 * (using expect API and fake timers). If Mocha/Chai is detected, we still use
 * expect-style APIs by relying on @types/jest style assertions available in Vitest/Jest.
 *
 * Detected testing library and framework: resolved at runtime by the agent.
 */

import { EventEmitter } from 'node:events'

// Framework-agnostic helpers
const usingVitest = (() => {
  try {
    // @ts-ignore
    return !!globalThis.vi
  } catch { return false }
})()

const usingJest = (() => {
  try {
    // @ts-ignore
    return !!globalThis.jest
  } catch { return false }
})()

const useFakeTimers = () => {
  if (usingVitest) {
    // @ts-ignore
    vi.useFakeTimers()
  } else if (usingJest) {
    // @ts-ignore
    jest.useFakeTimers()
  }
}

const advanceTimersBy = async (ms: number) => {
  if (usingVitest) {
    // @ts-ignore
    await vi.advanceTimersByTimeAsync(ms)
  } else if (usingJest) {
    // @ts-ignore
    jest.advanceTimersByTime(ms)
  } else {
    // no-op
  }
}

const runAllTimers = async () => {
  if (usingVitest) {
    // @ts-ignore
    await vi.runAllTimersAsync()
  } else if (usingJest) {
    // @ts-ignore
    jest.runAllTimers()
  }
}

// Minimal, in-file module mocks for @claude-zen/foundation
class MockEventBus extends EventEmitter {
  public emitted: Array<{ event: string; payload: any }> = []
  emit(eventName: string | symbol, ...args: any[]): boolean {
    this.emitted.push({ event: String(eventName), payload: args[0] })
    return super.emit(eventName, ...args)
  }
  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(eventName, listener)
  }
}

const mockBus = new MockEventBus()

// We need to intercept imports from '@claude-zen/foundation'
// This inline jest/vitest mock pattern covers both environments.
let logEntries: any[] = []
let errorEntries: any[] = []

const foundationMock = {
  EventBus: {
    getInstance: () => mockBus
  },
  EventLogger: {
    log: (event: string, data?: unknown) => { logEntries.push({ event, data }) },
    logError: (event: string, err: Error, data?: unknown) => { errorEntries.push({ event, err, data }) }
  },
  isValidEventName: (name: string) => true
}

// Vitest inline mock
try {
  // @ts-ignore
  if (globalThis.vi && typeof vi === 'object') {
    // @ts-ignore
    vi.mock('@claude-zen/foundation', () => foundationMock)
  }
} catch { /* ignore */ }

// Jest inline mock
try {
  // @ts-ignore
  if (globalThis.jest && typeof jest === 'function') {
    // @ts-ignore
    jest.mock('@claude-zen/foundation', () => foundationMock)
  }
} catch { /* ignore */ }

// Import after mocks applied
import { KnowledgeEventBridge } from './knowledge-event-bridge'
type EventDrivenKnowledgeSystem = {
  getEventEmitter(): Promise<EventEmitter | undefined>
}

// Test helpers
const createKnowledgeSystemWithEmitter = (emitter?: EventEmitter): EventDrivenKnowledgeSystem => ({
  async getEventEmitter() {
    return emitter
  }
})

const resetLogs = () => {
  logEntries = []
  errorEntries = []
  mockBus.emitted.length = 0
  mockBus.removeAllListeners()
}


describe('KnowledgeEventBridge - start and event forwarding', () => {
  beforeEach(() => {
    resetLogs()
  })

  it('registers the module on start and sets up forwarding for valid events', async () => {
    // Make only a subset valid to verify filtering behavior
    const validSet = new Set(['knowledge:item', 'knowledge:initialized', 'knowledge:error'])
    // Rewire isValidEventName at runtime
    // @ts-ignore
    const foundation = await import('@claude-zen/foundation')
    // @ts-ignore
    foundation.isValidEventName = (name: string) => validSet.has(name)

    const source = new EventEmitter()
    const ks = createKnowledgeSystemWithEmitter(source)
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'knowledge-test', heartbeatInterval: 10000 })

    await bridge.start()

    // Expect registry:module-register emission
    const register = mockBus.emitted.find(e => e.event === 'registry:module-register')
    expect(register).toBeTruthy()
    expect(register?.payload).toMatchObject({
      moduleId: 'knowledge-test',
      moduleName: 'Knowledge Management System',
      moduleType: 'knowledge-bridge'
    })
    expect(Array.isArray(register?.payload.supportedEvents)).toBe(true)
    expect(register?.payload.supportedEvents.length).toBeGreaterThan(0)

    // Only valid events forwarded
    source.emit('knowledge:item', { id: 1 })
    source.emit('knowledge:initialized', true)
    source.emit('knowledge:error', new Error('x'))
    source.emit('knowledge:item-updated', { nope: true }) // invalid per our override

    const forwarded = mockBus.emitted.filter(e =>
      ['knowledge:item','knowledge:initialized','knowledge:error','knowledge:item-updated'].includes(e.event)
    )

    const eventsForwarded = forwarded.map(e => e.event)
    expect(eventsForwarded).toEqual(
      expect.arrayContaining(['knowledge:item','knowledge:initialized','knowledge:error'])
    )
    expect(eventsForwarded).not.toContain('knowledge:item-updated')

    // Log message that forwarding is set up
    const setupLog = logEntries.find(l => l.event === 'knowledge-bridge:event-forwarding-setup')
    expect(setupLog).toBeTruthy()
    expect(setupLog?.data?.eventsForwarded).toBeGreaterThan(0)
  })

  it('does not throw when already started and logs an error', async () => {
    const ks = createKnowledgeSystemWithEmitter(new EventEmitter())
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'dup', heartbeatInterval: 10000 })

    await bridge.start()
    await bridge.start() // call again

    const already = errorEntries.find(e => e.event === 'knowledge-bridge:already-started')
    expect(already).toBeTruthy()
  })
})


describe('KnowledgeEventBridge - heartbeat', () => {
  beforeEach(() => {
    resetLogs()
    useFakeTimers()
  })

  it('emits periodic heartbeat to EventBus with metadata', async () => {
    const ks = createKnowledgeSystemWithEmitter(new EventEmitter())
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'hb', heartbeatInterval: 200 })

    await bridge.start()

    await advanceTimersBy(199)
    // No heartbeat yet
    expect(mockBus.emitted.find(e => e.event === 'registry:heartbeat')).toBeFalsy()

    await advanceTimersBy(1)
    let hb = mockBus.emitted.filter(e => e.event === 'registry:heartbeat')
    expect(hb.length).toBe(1)
    expect(hb[0].payload).toMatchObject({ moduleId: 'hb' })

    await advanceTimersBy(200)
    hb = mockBus.emitted.filter(e => e.event === 'registry:heartbeat')
    expect(hb.length).toBe(2)
  })
})


describe('KnowledgeEventBridge - stop', () => {
  beforeEach(() => {
    resetLogs()
    useFakeTimers()
  })

  it('clears heartbeat timer and logs stopped', async () => {
    const ks = createKnowledgeSystemWithEmitter(new EventEmitter())
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'stop', heartbeatInterval: 200 })
    await bridge.start()

    await advanceTimersBy(201)
    expect(mockBus.emitted.filter(e => e.event === 'registry:heartbeat').length).toBe(1)

    await bridge.stop()

    // Try to advance further; heartbeat should not emit more
    await advanceTimersBy(1000)
    expect(mockBus.emitted.filter(e => e.event === 'registry:heartbeat').length).toBe(1)

    const stopped = logEntries.find(l => l.event === 'knowledge-bridge:stopped')
    expect(stopped?.data?.moduleId).toBe('stop')
  })

  it('is a no-op if not started', async () => {
    const ks = createKnowledgeSystemWithEmitter(new EventEmitter())
    const bridge = new KnowledgeEventBridge(ks)
    await bridge.stop() // should not throw
    // No logs expected, just ensure no exceptions and no emitted events
    expect(mockBus.emitted.length).toBe(0)
  })
})


describe('KnowledgeEventBridge - setupEventForwarding edge cases', () => {
  beforeEach(() => {
    resetLogs()
    useFakeTimers()
  })

  it('handles missing event emitter gracefully (still starts heartbeat)', async () => {
    const ks: EventDrivenKnowledgeSystem = { async getEventEmitter() { return undefined } }
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'no-emitter', heartbeatInterval: 100 })

    await bridge.start()

    // Logged that there is no event emitter
    const info = logEntries.find(l => l.event === 'knowledge-bridge:no-event-emitter')
    expect(info).toBeTruthy()

    await advanceTimersBy(100)
    const hb = mockBus.emitted.find(e => e.event === 'registry:heartbeat')
    expect(hb).toBeTruthy()
  })

  it('logs error if getEventEmitter throws but continues starting', async () => {
    const ks: EventDrivenKnowledgeSystem = {
      async getEventEmitter() { throw new Error('boom') }
    }
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'throws', heartbeatInterval: 100 })

    await bridge.start()

    const err = errorEntries.find(e => e.event === 'knowledge-bridge:forwarding-setup-failed')
    expect(err).toBeTruthy()

    await advanceTimersBy(100)
    const hb = mockBus.emitted.find(e => e.event === 'registry:heartbeat')
    expect(hb).toBeTruthy()
  })
})


describe('KnowledgeEventBridge - getStatus', () => {
  beforeEach(() => {
    resetLogs()
  })

  it('returns moduleId, started flag, uptime, listener count and heartbeat interval', async () => {
    const source = new EventEmitter()
    const ks = createKnowledgeSystemWithEmitter(source)
    const bridge = new KnowledgeEventBridge(ks, { moduleId: 'status', heartbeatInterval: 321 })

    const pre = bridge.getStatus()
    expect(pre.isStarted).toBe(false)
    expect(pre.moduleId).toBe('status')
    expect(pre.heartbeatInterval).toBe(321)
    expect(typeof pre.uptime).toBe('number')

    await bridge.start()

    const post = bridge.getStatus()
    expect(post.isStarted).toBe(true)
    expect(post.eventListeners).toBeGreaterThanOrEqual(1)
    expect(post.heartbeatInterval).toBe(321)
  })
})
