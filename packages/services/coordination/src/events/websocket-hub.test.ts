/**
 * Unit tests for WebsocketHub
 * Testing library/framework: Vitest (describe/it/expect, vi.mock/vi.fn)
 * Focus: Behavior introduced/changed in websocket-hub.ts (EventBus bridging, subscriptions, broadcasting, publish, ping).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { WebSocket } from 'ws'

// -----------------------------------------------------------------------------
// Mocks for @claude-zen/foundation
// -----------------------------------------------------------------------------

const mockEventBus = (() => {
  const listeners: Array<(...args: unknown[]) => void> = []
  return {
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (event === '*') listeners.push(cb)
    }),
    __emitLocal: (payload: unknown, eventName: string) => {
      for (const cb of listeners) cb(payload, eventName)
    },
    emitSafe: vi.fn((_event: string, _payload: unknown) =>
      Promise.resolve({ isErr: () => false } as { isErr: () => boolean; error?: Error })
    ),
  }
})()

const mockIsValidEventName = vi.fn((name: string) => /^[a-z]+:/.test(name))
const mockLogger = {
  log: vi.fn(),
  logError: vi.fn(),
}
const mockRegistry = {
  registerModule: vi.fn(async () => undefined),
  getEventMetrics: vi.fn(async () => ({ total: 1 })),
  getEventFlows: vi.fn(async () => [{ from: 'a', to: 'b' }]),
  getActiveModules: vi.fn(async () => ['m1']),
}

vi.mock('@claude-zen/foundation', () => ({
  EventBus: { getInstance: () => mockEventBus },
  isValidEventName: mockIsValidEventName,
  EventLogger: mockLogger,
  DynamicEventRegistry: {} as unknown,
  dynamicEventRegistry: mockRegistry,
}))

// Stable UUIDs
import * as cryptoMod from 'crypto'
vi.spyOn(cryptoMod, 'randomUUID').mockImplementation(() => '00000000-0000-0000-0000-000000000000')

// Import SUT after mocks
import { WebsocketHub } from './websocket-hub'

describe('WebsocketHub', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(mockEventBus.emitSafe as any).mockImplementation((_e: string, _p: unknown) =>
      Promise.resolve({ isErr: () => false } as { isErr: () => boolean; error?: Error })
    )
    mockIsValidEventName.mockImplementation((name: string) => /^[a-z]+:/.test(name))
    ;(mockRegistry.registerModule as any).mockResolvedValue(undefined)
    ;(mockRegistry.getEventMetrics as any).mockResolvedValue({ total: 1 })
    ;(mockRegistry.getEventFlows as any).mockResolvedValue([{ from: 'a', to: 'b' }])
    ;(mockRegistry.getActiveModules as any).mockResolvedValue(['m1'])
    ;(mockLogger.log as any).mockImplementation(() => {})
    ;(mockLogger.logError as any).mockImplementation(() => {})
    delete (process.env as any).ZEN_EVENT_HUB_BRIDGE
  })

  const makeWs = () => ({ send: vi.fn() } as unknown as WebSocket)

  it('constructs with bridge enabled by default and logs constructor info', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:constructor', expect.objectContaining({
      bridgeEnabled: true,
      whitelistPrefixes: expect.any(Array),
    }))
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:event-integration-setup')
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:registered-with-event-registry')
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:initialized')
  })

  it('respects ZEN_EVENT_HUB_BRIDGE=off by skipping event integration', async () => {
    ;(process.env as any).ZEN_EVENT_HUB_BRIDGE = 'off'
    const hub = new WebsocketHub()
    await hub.initialize()
    expect(mockRegistry.registerModule).toHaveBeenCalledTimes(1)
    expect(mockEventBus.on).not.toHaveBeenCalled()
  })

  it('initialize is idempotent', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()
    await hub.initialize()
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:already-initialized')
  })

  it('registers with DynamicEventRegistry and fail-open logs on error', async () => {
    ;(mockRegistry.registerModule as any).mockRejectedValueOnce(new Error('boom'))
    const hub = new WebsocketHub()
    await hub.initialize()
    expect(mockLogger.logError).toHaveBeenCalledWith(
      'websocket-hub:registry-registration-failed',
      expect.any(Error),
      expect.objectContaining({ component: 'websocket-hub' })
    )
  })

  it('forwards whitelisted and valid EventBus events to subscribed clients', async () => {
    const ws = makeWs()
    const hub = new WebsocketHub()
    await hub.initialize()
    const id = hub.addConnection(ws)
    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', services: ['all'] }))

    mockEventBus.__emitLocal({ x: 1 }, 'system:ready')

    expect(ws.send).toHaveBeenCalledTimes(1)
    const sentPayload = JSON.parse((ws.send as any).mock.calls[0][0])
    expect(sentPayload).toEqual(expect.objectContaining({
      id: '00000000-0000-0000-0000-000000000000',
      type: 'eventbus',
      source: 'websocket-hub',
    }))
    expect(sentPayload.data).toEqual(expect.objectContaining({
      type: 'system:ready',
      source: 'foundation-eventbus',
    }))
  })

  it('does not forward non-whitelisted or invalid events', async () => {
    const ws = makeWs()
    const hub = new WebsocketHub()
    await hub.initialize()
    const id = hub.addConnection(ws)
    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', services: ['all'] }))

    mockIsValidEventName.mockReturnValueOnce(false)
    mockEventBus.__emitLocal({ a: 1 }, 'weird-event')

    mockIsValidEventName.mockReturnValueOnce(true)
    mockEventBus.__emitLocal({ a: 1 }, 'chat:new')

    expect(ws.send).not.toHaveBeenCalled()
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:invalid-event-name', expect.any(Object))
  })

  it('handleMessage routes subscribe/unsubscribe/publish/ping and unknown types', async () => {
    const ws = makeWs()
    const hub = new WebsocketHub()
    await hub.initialize()
    const id = hub.addConnection(ws)

    hub.handleMessage('nope', JSON.stringify({ type: 'ping' }))
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:unknown-connection')

    hub.handleMessage(id, '{bad json')
    expect(mockLogger.logError).toHaveBeenCalledWith(
      'websocket-hub:message-handling-failed',
      expect.any(Error),
      expect.any(Object)
    )

    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', services: ['svc1'], messageTypes: ['t1'] }))
    hub.handleMessage(id, JSON.stringify({ type: 'unsubscribe', services: ['svc1'] }))

    hub.handleMessage(id, JSON.stringify({ type: 'publish', payload: { p: 1 } }))
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:publish-missing-event')

    mockIsValidEventName.mockReturnValueOnce(false)
    hub.handleMessage(id, JSON.stringify({ type: 'publish', event: 'bad', payload: { p: 1 } }))
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:publish-invalid-event')

    mockIsValidEventName.mockReturnValueOnce(true)
    ;(mockEventBus.emitSafe as any).mockResolvedValueOnce({ isErr: () => false })
    hub.handleMessage(id, JSON.stringify({ type: 'publish', event: 'system:update', payload: { p: 2 } }))
    await Promise.resolve()
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:publish-success')

    mockIsValidEventName.mockReturnValueOnce(true)
    const errObj = new Error('emit failed')
    ;(mockEventBus.emitSafe as any).mockResolvedValueOnce({ isErr: () => true, error: errObj })
    hub.handleMessage(id, JSON.stringify({ type: 'publish', event: 'system:update', payload: { p: 3 } }))
    await Promise.resolve()
    expect(mockLogger.logError).toHaveBeenCalledWith(
      'websocket-hub:publish-emit-failed',
      errObj,
      expect.objectContaining({ component: 'websocket-hub' })
    )

    mockIsValidEventName.mockReturnValueOnce(true)
    ;(mockEventBus.emitSafe as any).mockRejectedValueOnce(new Error('reject'))
    hub.handleMessage(id, JSON.stringify({ type: 'publish', event: 'system:update', payload: { p: 4 } }))
    await Promise.resolve()
    expect(mockLogger.logError).toHaveBeenCalledWith(
      'websocket-hub:publish-async-failed',
      expect.any(Error),
      expect.objectContaining({ component: 'websocket-hub' })
    )

    ;(ws.send as any).mockClear()
    hub.handleMessage(id, JSON.stringify({ type: 'ping' }))
    expect(ws.send).toHaveBeenCalledTimes(1)
    const pong = JSON.parse((ws.send as any).mock.calls[0][0])
    expect(pong.type).toBe('pong')

    hub.handleMessage(id, JSON.stringify({ type: 'wat' }))
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:unknown-message-type')
  })

  it('broadcast sends only to subscribed connections (exact, all, wildcard, prefix)', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()

    const wsA = makeWs()
    const wsB = makeWs()
    const wsC = makeWs()
    const idA = hub.addConnection(wsA)
    const idB = hub.addConnection(wsB)
    const idC = hub.addConnection(wsC)

    hub.handleMessage(idA, JSON.stringify({ type: 'subscribe', messageTypes: ['news'] }))
    hub.handleMessage(idB, JSON.stringify({ type: 'subscribe', services: ['all'] }))
    hub.handleMessage(idC, JSON.stringify({ type: 'subscribe', messageTypes: ['system*', 'alerts'] }))

    ;(wsA.send as any).mockClear()
    ;(wsB.send as any).mockClear()
    ;(wsC.send as any).mockClear()

    hub.broadcast('news', { n: 1 })
    expect(wsA.send).toHaveBeenCalledTimes(1)
    expect(wsB.send).toHaveBeenCalledTimes(1)
    expect(wsC.send).toHaveBeenCalledTimes(0)

    ;(wsA.send as any).mockClear()
    ;(wsB.send as any).mockClear()
    ;(wsC.send as any).mockClear()

    hub.broadcast('system:health', { ok: true })
    expect(wsA.send).toHaveBeenCalledTimes(0)
    expect(wsB.send).toHaveBeenCalledTimes(1)
    expect(wsC.send).toHaveBeenCalledTimes(1)

    hub.handleMessage(idA, JSON.stringify({ type: 'subscribe', messageTypes: ['system'] }))
    ;(wsA.send as any).mockClear()
    hub.broadcast('system:ready', {})
    expect(wsA.send).toHaveBeenCalledTimes(1)
  })

  it('broadcast returns silently with zero connections (no errors)', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()
    expect(() => hub.broadcast('x', {})).not.toThrow()
    expect(mockLogger.logError).not.toHaveBeenCalled()
  })

  it('sendToConnection removes connection on send failure (via broadcast path)', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()
    const badWs = { send: vi.fn(() => { throw new Error('broken') }) } as unknown as WebSocket
    const id = hub.addConnection(badWs)
    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', services: ['all'] }))
    expect(hub.getStats().connections).toBe(1)
    hub.broadcast('anything', {})
    expect(hub.getStats().connections).toBe(0)
    expect(mockLogger.logError).toHaveBeenCalledWith(
      'websocket-hub:send-failed',
      expect.any(Error),
      expect.objectContaining({ component: 'websocket-hub' })
    )
  })

  it('addConnection/removeConnection affect stats and log appropriately', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()
    const ws = makeWs()
    const id = hub.addConnection(ws)
    expect(hub.getStats()).toEqual({ connections: 1, totalSubscriptions: 0 })
    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', messageTypes: ['foo', 'bar'] }))
    expect(hub.getStats()).toEqual({ connections: 1, totalSubscriptions: 2 })
    hub.removeConnection(id)
    expect(hub.getStats()).toEqual({ connections: 0, totalSubscriptions: 0 })
    expect(mockLogger.log).toHaveBeenCalledWith('websocket-hub:connection-removed')
  })

  it('execute delegates to initialize', async () => {
    const hub = new WebsocketHub()
    const initSpy = vi.spyOn(hub as any, 'initialize').mockResolvedValue(undefined)
    await hub.execute()
    expect(initSpy).toHaveBeenCalledTimes(1)
  })

  it('getEventSystemMetrics returns registry data and websocket stats; fail-open on errors', async () => {
    const hub = new WebsocketHub()
    const ws = makeWs()
    const id = hub.addConnection(ws)
    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', services: ['all'] }))

    const ok = await hub.getEventSystemMetrics()
    expect(ok).toEqual({
      metrics: { total: 1 },
      flows: [{ from: 'a', to: 'b' }],
      activeModules: ['m1'],
      websocketStats: { connections: 1, totalSubscriptions: 1 },
    })

    ;(mockRegistry.getEventMetrics as any).mockRejectedValueOnce(new Error('x'))
    ;(mockRegistry.getEventFlows as any).mockRejectedValueOnce(new Error('y'))
    ;(mockRegistry.getActiveModules as any).mockRejectedValueOnce(new Error('z'))
    const fallback = await hub.getEventSystemMetrics()
    expect(fallback).toEqual({
      metrics: null,
      flows: null,
      activeModules: null,
      websocketStats: { connections: 1, totalSubscriptions: 1 },
    })
    expect(mockLogger.logError).toHaveBeenCalledWith(
      'websocket-hub:metrics-failed',
      expect.any(Error),
      expect.objectContaining({ component: 'websocket-hub' })
    )
  })

  it('subscribe/unsubscribe manage Set semantics correctly (dedupe, removal)', async () => {
    const hub = new WebsocketHub()
    await hub.initialize()
    const ws = makeWs()
    const id = hub.addConnection(ws)

    hub.handleMessage(id, JSON.stringify({ type: 'subscribe', services: ['svcA', 'svcA'], messageTypes: ['m1'] }))
    expect(hub.getStats().totalSubscriptions).toBe(2)

    hub.handleMessage(id, JSON.stringify({ type: 'unsubscribe', services: ['svcA'], messageTypes: ['m1'] }))
    expect(hub.getStats().totalSubscriptions).toBe(0)
  })
})