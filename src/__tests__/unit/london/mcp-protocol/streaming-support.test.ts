/**
 * MCP Streaming Support - TDD London Style
 *
 * Tests streaming capabilities using London School principles:
 * - Mock streaming infrastructure and data flow
 * - Test streaming protocol compliance and backpressure
 * - Verify stream lifecycle management and error handling
 * - Focus on streaming interactions and contracts
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { MCPContext, MCPRequest, MCPResponse } from '../../../../utils/types';

// === MOCK DEPENDENCIES (London School Contract Definition) ===

const mockStreamManager = {
  createStream: jest.fn(),
  closeStream: jest.fn(),
  writeToStream: jest.fn(),
  readFromStream: jest.fn(),
  getStreamState: jest.fn(),
  handleBackpressure: jest.fn(),
};

const mockBufferManager = {
  allocateBuffer: jest.fn(),
  releaseBuffer: jest.fn(),
  getBufferUsage: jest.fn(),
  flushBuffer: jest.fn(),
  resizeBuffer: jest.fn(),
};

const mockFlowController = {
  checkBackpressure: jest.fn(),
  pauseStream: jest.fn(),
  resumeStream: jest.fn(),
  adjustBufferSize: jest.fn(),
  getFlowMetrics: jest.fn(),
};

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockMetricsCollector = {
  recordStreamCreated: jest.fn(),
  recordStreamClosed: jest.fn(),
  recordDataTransfer: jest.fn(),
  recordBackpressureEvent: jest.fn(),
  recordStreamError: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  once: jest.fn(),
};

// === CONTRACT INTERFACES ===

interface StreamingContract {
  createStreamingSession(request: MCPRequest, context: MCPContext): Promise<StreamSession>;
  handleStreamingRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse>;
  closeStreamingSession(streamId: string): Promise<void>;
  handleStreamData(streamId: string, data: StreamData): Promise<void>;
}

interface StreamSession {
  id: string;
  requestId: string | number;
  method: string;
  state: 'active' | 'paused' | 'closed' | 'error';
  created: Date;
  lastActivity: Date;
  bytesTransferred: number;
  bufferSize: number;
  maxBufferSize: number;
}

interface StreamData {
  id: string;
  sequence: number;
  data: unknown;
  isLast: boolean;
  timestamp: Date;
}

interface BackpressureEvent {
  streamId: string;
  bufferUsage: number;
  threshold: number;
  action: 'pause' | 'resume' | 'resize';
}

interface StreamingProtocolContract {
  startStream(params: StreamStartParams): Promise<StreamResponse>;
  streamChunk(streamId: string, chunk: StreamChunk): Promise<void>;
  endStream(streamId: string, summary?: StreamSummary): Promise<void>;
  handleStreamError(streamId: string, error: Error): Promise<void>;
}

interface StreamStartParams {
  method: string;
  bufferSize?: number;
  maxChunks?: number;
  compression?: boolean;
}

interface StreamResponse {
  streamId: string;
  bufferSize: number;
  readyForData: boolean;
}

interface StreamChunk {
  sequence: number;
  data: unknown;
  checksum?: string;
  isLast: boolean;
}

interface StreamSummary {
  totalChunks: number;
  totalBytes: number;
  duration: number;
  errors: number;
}

// === MOCK IMPLEMENTATION ===

class MockMCPStreamingHandler implements StreamingContract, StreamingProtocolContract {
  private activeSessions = new Map<string, StreamSession>();

  constructor(
    private streamManager = mockStreamManager,
    private bufferManager = mockBufferManager,
    private flowController = mockFlowController,
    private logger = mockLogger,
    private metrics = mockMetricsCollector,
    private eventEmitter = mockEventEmitter,
  ) {}

  async createStreamingSession(request: MCPRequest, context: MCPContext): Promise<StreamSession> {
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    this.logger.info('Creating streaming session', {
      streamId,
      method: request.method,
      sessionId: context.sessionId,
    });

    const session: StreamSession = {
      id: streamId,
      requestId: request.id,
      method: request.method,
      state: 'active',
      created: new Date(),
      lastActivity: new Date(),
      bytesTransferred: 0,
      bufferSize: 64 * 1024, // 64KB default
      maxBufferSize: 1024 * 1024, // 1MB max
    };

    // Initialize stream infrastructure
    const streamCreated = this.streamManager.createStream(streamId, {
      bufferSize: session.bufferSize,
      maxBufferSize: session.maxBufferSize,
    });

    if (streamCreated) {
      this.activeSessions.set(streamId, session);
      this.metrics.recordStreamCreated(streamId, request.method);
      this.eventEmitter.emit('stream:created', { streamId, session });

      // Setup stream event handlers
      this.setupStreamEventHandlers(streamId);
    }

    return session;
  }

  async handleStreamingRequest(request: MCPRequest, context: MCPContext): Promise<MCPResponse> {
    this.logger.debug('Handling streaming request', {
      method: request.method,
      id: request.id,
    });

    switch (request.method) {
      case 'stream/start':
        return this.handleStreamStart(request, context);
      case 'stream/data':
        return this.handleStreamData(request.params.streamId, request.params.data);
      case 'stream/end':
        return this.handleStreamEnd(request, context);
      default:
        throw new Error(`Unsupported streaming method: ${request.method}`);
    }
  }

  async closeStreamingSession(streamId: string): Promise<void> {
    this.logger.info('Closing streaming session', { streamId });

    const session = this.activeSessions.get(streamId);
    if (!session) {
      this.logger.warn('Attempt to close non-existent stream', { streamId });
      return;
    }

    // Close stream infrastructure
    this.streamManager.closeStream(streamId);
    this.bufferManager.releaseBuffer(streamId);

    // Update session state
    session.state = 'closed';
    this.activeSessions.delete(streamId);

    this.metrics.recordStreamClosed(streamId, session.bytesTransferred);
    this.eventEmitter.emit('stream:closed', { streamId, session });
  }

  async handleStreamData(streamId: string, data: StreamData): Promise<void> {
    const session = this.activeSessions.get(streamId);
    if (!session) {
      throw new Error(`Stream not found: ${streamId}`);
    }

    this.logger.debug('Processing stream data', {
      streamId,
      sequence: data.sequence,
      isLast: data.isLast,
    });

    // Check backpressure
    const backpressureCheck = this.flowController.checkBackpressure(streamId);
    if (backpressureCheck.shouldPause) {
      await this.handleBackpressure(streamId, backpressureCheck.bufferUsage);
    }

    // Write data to stream
    const bytesWritten = this.streamManager.writeToStream(streamId, data);
    session.bytesTransferred += bytesWritten;
    session.lastActivity = new Date();

    this.metrics.recordDataTransfer(streamId, bytesWritten);

    // Handle end of stream
    if (data.isLast) {
      await this.endStream(streamId, {
        totalChunks: data.sequence + 1,
        totalBytes: session.bytesTransferred,
        duration: Date.now() - session.created.getTime(),
        errors: 0,
      });
    }
  }

  async startStream(params: StreamStartParams): Promise<StreamResponse> {
    const streamId = `protocol-stream-${Date.now()}`;

    this.logger.info('Starting protocol stream', {
      streamId,
      method: params.method,
    });

    const bufferSize = params.bufferSize || 64 * 1024;
    const buffer = this.bufferManager.allocateBuffer(streamId, bufferSize);

    if (buffer) {
      this.eventEmitter.emit('stream:protocol-started', { streamId, params });
      return {
        streamId,
        bufferSize,
        readyForData: true,
      };
    }

    throw new Error('Failed to allocate stream buffer');
  }

  async streamChunk(streamId: string, chunk: StreamChunk): Promise<void> {
    this.logger.debug('Processing stream chunk', {
      streamId,
      sequence: chunk.sequence,
      isLast: chunk.isLast,
    });

    // Validate chunk sequence
    if (chunk.sequence < 0) {
      throw new Error(`Invalid chunk sequence: ${chunk.sequence}`);
    }

    // Process chunk data
    const processed = this.streamManager.writeToStream(streamId, {
      id: streamId,
      sequence: chunk.sequence,
      data: chunk.data,
      isLast: chunk.isLast,
      timestamp: new Date(),
    });

    if (!processed) {
      throw new Error(`Failed to process chunk ${chunk.sequence} for stream ${streamId}`);
    }

    this.eventEmitter.emit('stream:chunk-processed', { streamId, chunk });
  }

  async endStream(streamId: string, summary?: StreamSummary): Promise<void> {
    this.logger.info('Ending stream', { streamId, summary });

    const session = this.activeSessions.get(streamId);
    if (session) {
      session.state = 'closed';
    }

    this.streamManager.closeStream(streamId);
    this.bufferManager.releaseBuffer(streamId);

    if (summary) {
      this.metrics.recordDataTransfer(streamId, summary.totalBytes);
    }

    this.eventEmitter.emit('stream:ended', { streamId, summary });
  }

  async handleStreamError(streamId: string, error: Error): Promise<void> {
    this.logger.error('Stream error occurred', {
      streamId,
      error: error.message,
    });

    const session = this.activeSessions.get(streamId);
    if (session) {
      session.state = 'error';
    }

    this.metrics.recordStreamError(streamId, error.message);
    this.eventEmitter.emit('stream:error', { streamId, error });

    // Cleanup resources
    await this.closeStreamingSession(streamId);
  }

  private async handleStreamStart(request: MCPRequest, context: MCPContext): Promise<MCPResponse> {
    const session = await this.createStreamingSession(request, context);

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        streamId: session.id,
        bufferSize: session.bufferSize,
        maxBufferSize: session.maxBufferSize,
        state: session.state,
      },
    };
  }

  private async handleStreamEnd(request: MCPRequest, _context: MCPContext): Promise<MCPResponse> {
    const { streamId } = request.params;
    await this.closeStreamingSession(streamId);

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        streamId,
        closed: true,
      },
    };
  }

  private async handleBackpressure(streamId: string, bufferUsage: number): Promise<void> {
    this.logger.warn('Backpressure detected', { streamId, bufferUsage });

    const backpressureEvent: BackpressureEvent = {
      streamId,
      bufferUsage,
      threshold: 0.8, // 80% threshold
      action: 'pause',
    };

    this.metrics.recordBackpressureEvent(streamId, bufferUsage);
    this.flowController.pauseStream(streamId);

    // Try to resize buffer if possible
    const session = this.activeSessions.get(streamId);
    if (session && session.bufferSize < session.maxBufferSize) {
      const newSize = Math.min(session.bufferSize * 2, session.maxBufferSize);
      this.bufferManager.resizeBuffer(streamId, newSize);
      session.bufferSize = newSize;
      backpressureEvent.action = 'resize';
    }

    this.eventEmitter.emit('stream:backpressure', backpressureEvent);
  }

  private setupStreamEventHandlers(streamId: string): void {
    // Setup event handlers for stream lifecycle
    this.eventEmitter.on(`stream:${streamId}:data`, (data) => {
      this.handleStreamData(streamId, data);
    });

    this.eventEmitter.on(`stream:${streamId}:error`, (error) => {
      this.handleStreamError(streamId, error);
    });

    this.eventEmitter.on(`stream:${streamId}:close`, () => {
      this.closeStreamingSession(streamId);
    });
  }
}

describe('MCP Streaming Support - London TDD', () => {
  describe('🎯 Acceptance Tests - Stream Creation', () => {
    describe('User Story: Create Streaming Session', () => {
      it('should create streaming session with proper initialization', async () => {
        // Arrange - Mock successful stream creation
        mockStreamManager.createStream.mockReturnValue(true);
        mockBufferManager.allocateBuffer.mockReturnValue(true);
        mockEventEmitter.emit.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        const streamRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'stream-create-1',
          method: 'stream/start',
          params: {
            bufferSize: 128 * 1024, // 128KB
            maxChunks: 1000,
          },
        };

        const context: MCPContext = {
          sessionId: 'session-stream',
          logger: mockLogger,
        };

        // Act - Create streaming session
        const session = await streamingHandler.createStreamingSession(streamRequest, context);

        // Assert - Verify stream creation conversation
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Creating streaming session',
          expect.objectContaining({
            streamId: session.id,
            method: 'stream/start',
            sessionId: 'session-stream',
          }),
        );
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
          session.id,
          expect.objectContaining({
            bufferSize: expect.any(Number),
            maxBufferSize: expect.any(Number),
          }),
        );
        expect(mockMetricsCollector.recordStreamCreated).toHaveBeenCalledWith(
          session.id,
          'stream/start',
        );
        expect(mockEventEmitter.emit).toHaveBeenCalledWith('stream:created', {
          streamId: session.id,
          session,
        });

        expect(session.id).toBeDefined();
        expect(session.state).toBe('active');
        expect(session.method).toBe('stream/start');
        expect(session.bytesTransferred).toBe(0);
      });

      it('should handle stream creation failure gracefully', async () => {
        // Arrange - Mock stream creation failure
        mockStreamManager.createStream.mockReturnValue(false);

        const streamingHandler = new MockMCPStreamingHandler();

        const failedStreamRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'stream-fail-1',
          method: 'stream/start',
          params: { bufferSize: 1024 },
        };

        const context: MCPContext = {
          sessionId: 'session-fail',
          logger: mockLogger,
        };

        // Act - Attempt to create failing stream
        const session = await streamingHandler.createStreamingSession(failedStreamRequest, context);

        // Assert - Verify failure handling
        expect(mockStreamManager.createStream).toHaveBeenCalled();
        expect(mockMetricsCollector.recordStreamCreated).not.toHaveBeenCalled();
        // Session should still be created but not active in the infrastructure
        expect(session.id).toBeDefined();
      });
    });

    describe('User Story: Handle Stream Start Protocol', () => {
      it('should process stream/start requests correctly', async () => {
        // Arrange - Mock stream start protocol
        mockStreamManager.createStream.mockReturnValue(true);
        mockEventEmitter.emit.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        const streamStartRequest: MCPRequest = {
          jsonrpc: '2.0',
          id: 'protocol-start-1',
          method: 'stream/start',
          params: {
            method: 'data/export',
            bufferSize: 256 * 1024,
            compression: true,
          },
        };

        const context: MCPContext = {
          sessionId: 'session-protocol',
          logger: mockLogger,
        };

        // Act - Handle stream start request
        const response = await streamingHandler.handleStreamingRequest(streamStartRequest, context);

        // Assert - Verify stream start protocol handling
        expect(mockLogger.debug).toHaveBeenCalledWith('Handling streaming request', {
          method: 'stream/start',
          id: 'protocol-start-1',
        });
        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe('protocol-start-1');
        expect(response.result).toBeDefined();
        expect(response.result.streamId).toBeDefined();
        expect(response.result.state).toBe('active');
      });
    });
  });

  describe('🌊 Acceptance Tests - Data Streaming', () => {
    describe('User Story: Stream Data Chunks', () => {
      it('should process data chunks in sequence', async () => {
        // Arrange - Mock data chunk processing
        mockStreamManager.writeToStream.mockReturnValue(1024); // 1KB written
        mockFlowController.checkBackpressure.mockReturnValue({ shouldPause: false });
        mockEventEmitter.emit.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        // First create a session
        const session = await streamingHandler.createStreamingSession(
          {
            jsonrpc: '2.0',
            id: 'chunk-test',
            method: 'data/stream',
            params: {},
          },
          { sessionId: 'session-chunks', logger: mockLogger },
        );

        const chunkData: StreamData = {
          id: session.id,
          sequence: 1,
          data: { content: 'test data chunk', size: 1024 },
          isLast: false,
          timestamp: new Date(),
        };

        // Act - Process data chunk
        await streamingHandler.handleStreamData(session.id, chunkData);

        // Assert - Verify chunk processing
        expect(mockLogger.debug).toHaveBeenCalledWith('Processing stream data', {
          streamId: session.id,
          sequence: 1,
          isLast: false,
        });
        expect(mockFlowController.checkBackpressure).toHaveBeenCalledWith(session.id);
        expect(mockStreamManager.writeToStream).toHaveBeenCalledWith(session.id, chunkData);
        expect(mockMetricsCollector.recordDataTransfer).toHaveBeenCalledWith(session.id, 1024);
      });

      it('should handle last chunk and end stream', async () => {
        // Arrange - Mock last chunk processing
        mockStreamManager.writeToStream.mockReturnValue(512);
        mockFlowController.checkBackpressure.mockReturnValue({ shouldPause: false });
        mockStreamManager.closeStream.mockReturnValue(undefined);
        mockBufferManager.releaseBuffer.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        // Create session
        const session = await streamingHandler.createStreamingSession(
          {
            jsonrpc: '2.0',
            id: 'last-chunk-test',
            method: 'data/stream',
            params: {},
          },
          { sessionId: 'session-last', logger: mockLogger },
        );

        const lastChunkData: StreamData = {
          id: session.id,
          sequence: 5,
          data: { content: 'final chunk', size: 512 },
          isLast: true,
          timestamp: new Date(),
        };

        // Act - Process last chunk
        await streamingHandler.handleStreamData(session.id, lastChunkData);

        // Assert - Verify last chunk handling and stream end
        expect(mockStreamManager.writeToStream).toHaveBeenCalledWith(session.id, lastChunkData);
        expect(mockEventEmitter.emit).toHaveBeenCalledWith('stream:ended', {
          streamId: session.id,
          summary: expect.objectContaining({
            totalChunks: 6, // sequence 5 + 1
            totalBytes: expect.any(Number),
            duration: expect.any(Number),
            errors: 0,
          }),
        });
      });
    });

    describe('User Story: Handle Protocol Stream Chunks', () => {
      it('should process protocol stream chunks correctly', async () => {
        // Arrange - Mock protocol chunk processing
        mockBufferManager.allocateBuffer.mockReturnValue(true);
        mockStreamManager.writeToStream.mockReturnValue(true);
        mockEventEmitter.emit.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        // Start protocol stream
        const streamResponse = await streamingHandler.startStream({
          method: 'analysis/stream',
          bufferSize: 64 * 1024,
          compression: false,
        });

        const chunk: StreamChunk = {
          sequence: 1,
          data: { analysis: 'code quality check', results: [1, 2, 3] },
          checksum: 'abc123',
          isLast: false,
        };

        // Act - Process protocol chunk
        await streamingHandler.streamChunk(streamResponse.streamId, chunk);

        // Assert - Verify protocol chunk processing
        expect(mockLogger.debug).toHaveBeenCalledWith('Processing stream chunk', {
          streamId: streamResponse.streamId,
          sequence: 1,
          isLast: false,
        });
        expect(mockStreamManager.writeToStream).toHaveBeenCalledWith(
          streamResponse.streamId,
          expect.objectContaining({
            id: streamResponse.streamId,
            sequence: 1,
            data: chunk.data,
            isLast: false,
          }),
        );
        expect(mockEventEmitter.emit).toHaveBeenCalledWith('stream:chunk-processed', {
          streamId: streamResponse.streamId,
          chunk,
        });
      });

      it('should validate chunk sequence numbers', async () => {
        // Arrange - Mock invalid chunk sequence
        const streamingHandler = new MockMCPStreamingHandler();

        const streamResponse = await streamingHandler.startStream({
          method: 'validation/stream',
        });

        const invalidChunk: StreamChunk = {
          sequence: -1, // Invalid sequence
          data: { test: 'data' },
          isLast: false,
        };

        // Act & Assert - Should throw error for invalid sequence
        await expect(
          streamingHandler.streamChunk(streamResponse.streamId, invalidChunk),
        ).rejects.toThrow('Invalid chunk sequence: -1');
      });
    });
  });

  describe('🚰 Acceptance Tests - Backpressure Management', () => {
    describe('User Story: Handle Buffer Backpressure', () => {
      it('should detect and handle backpressure events', async () => {
        // Arrange - Mock backpressure scenario
        mockStreamManager.createStream.mockReturnValue(true);
        mockFlowController.checkBackpressure.mockReturnValue({
          shouldPause: true,
          bufferUsage: 0.85, // 85% buffer usage
        });
        mockFlowController.pauseStream.mockReturnValue(undefined);
        mockBufferManager.resizeBuffer.mockReturnValue(true);

        const streamingHandler = new MockMCPStreamingHandler();

        // Create session
        const session = await streamingHandler.createStreamingSession(
          {
            jsonrpc: '2.0',
            id: 'backpressure-test',
            method: 'heavy/stream',
            params: {},
          },
          { sessionId: 'session-backpressure', logger: mockLogger },
        );

        const heavyData: StreamData = {
          id: session.id,
          sequence: 1,
          data: { heavyPayload: 'x'.repeat(50000) }, // Large payload
          isLast: false,
          timestamp: new Date(),
        };

        // Act - Process data that triggers backpressure
        await streamingHandler.handleStreamData(session.id, heavyData);

        // Assert - Verify backpressure handling
        expect(mockFlowController.checkBackpressure).toHaveBeenCalledWith(session.id);
        expect(mockLogger.warn).toHaveBeenCalledWith('Backpressure detected', {
          streamId: session.id,
          bufferUsage: 0.85,
        });
        expect(mockMetricsCollector.recordBackpressureEvent).toHaveBeenCalledWith(session.id, 0.85);
        expect(mockFlowController.pauseStream).toHaveBeenCalledWith(session.id);
        expect(mockEventEmitter.emit).toHaveBeenCalledWith(
          'stream:backpressure',
          expect.objectContaining({
            streamId: session.id,
            bufferUsage: 0.85,
            action: expect.any(String),
          }),
        );
      });

      it('should resize buffers when possible during backpressure', async () => {
        // Arrange - Mock buffer resize scenario
        mockStreamManager.createStream.mockReturnValue(true);
        mockFlowController.checkBackpressure.mockReturnValue({
          shouldPause: true,
          bufferUsage: 0.9,
        });
        mockBufferManager.resizeBuffer.mockReturnValue(true);

        const streamingHandler = new MockMCPStreamingHandler();

        // Create session with room for buffer growth
        const session = await streamingHandler.createStreamingSession(
          {
            jsonrpc: '2.0',
            id: 'resize-test',
            method: 'expandable/stream',
            params: {},
          },
          { sessionId: 'session-resize', logger: mockLogger },
        );

        // Simulate buffer resize opportunity
        const originalBufferSize = session.bufferSize;

        const data: StreamData = {
          id: session.id,
          sequence: 1,
          data: { largeData: 'test'.repeat(20000) },
          isLast: false,
          timestamp: new Date(),
        };

        // Act - Trigger backpressure with resize capability
        await streamingHandler.handleStreamData(session.id, data);

        // Assert - Verify buffer resize
        expect(mockBufferManager.resizeBuffer).toHaveBeenCalledWith(
          session.id,
          originalBufferSize * 2, // Should double buffer size
        );
        expect(mockEventEmitter.emit).toHaveBeenCalledWith(
          'stream:backpressure',
          expect.objectContaining({
            action: 'resize',
          }),
        );
      });
    });
  });

  describe('🔚 Acceptance Tests - Stream Lifecycle', () => {
    describe('User Story: Close Streaming Sessions', () => {
      it('should close streams and cleanup resources', async () => {
        // Arrange - Mock stream closure
        mockStreamManager.createStream.mockReturnValue(true);
        mockStreamManager.closeStream.mockReturnValue(undefined);
        mockBufferManager.releaseBuffer.mockReturnValue(undefined);
        mockEventEmitter.emit.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        // Create session to close
        const session = await streamingHandler.createStreamingSession(
          {
            jsonrpc: '2.0',
            id: 'close-test',
            method: 'closeable/stream',
            params: {},
          },
          { sessionId: 'session-close', logger: mockLogger },
        );

        // Act - Close streaming session
        await streamingHandler.closeStreamingSession(session.id);

        // Assert - Verify stream closure conversation
        expect(mockLogger.info).toHaveBeenCalledWith('Closing streaming session', {
          streamId: session.id,
        });
        expect(mockStreamManager.closeStream).toHaveBeenCalledWith(session.id);
        expect(mockBufferManager.releaseBuffer).toHaveBeenCalledWith(session.id);
        expect(mockMetricsCollector.recordStreamClosed).toHaveBeenCalledWith(
          session.id,
          expect.any(Number), // bytes transferred
        );
        expect(mockEventEmitter.emit).toHaveBeenCalledWith('stream:closed', {
          streamId: session.id,
          session: expect.objectContaining({ state: 'closed' }),
        });
      });

      it('should handle closure of non-existent streams gracefully', async () => {
        // Arrange - Mock non-existent stream closure
        const streamingHandler = new MockMCPStreamingHandler();
        const nonExistentStreamId = 'non-existent-stream';

        // Act - Attempt to close non-existent stream
        await streamingHandler.closeStreamingSession(nonExistentStreamId);

        // Assert - Verify graceful handling
        expect(mockLogger.warn).toHaveBeenCalledWith('Attempt to close non-existent stream', {
          streamId: nonExistentStreamId,
        });
        expect(mockStreamManager.closeStream).not.toHaveBeenCalled();
      });
    });

    describe('User Story: Handle Stream Errors', () => {
      it('should handle stream errors and cleanup resources', async () => {
        // Arrange - Mock stream error scenario
        mockStreamManager.createStream.mockReturnValue(true);
        mockStreamManager.closeStream.mockReturnValue(undefined);
        mockBufferManager.releaseBuffer.mockReturnValue(undefined);
        mockEventEmitter.emit.mockReturnValue(undefined);

        const streamingHandler = new MockMCPStreamingHandler();

        // Create session
        const session = await streamingHandler.createStreamingSession(
          {
            jsonrpc: '2.0',
            id: 'error-test',
            method: 'error/stream',
            params: {},
          },
          { sessionId: 'session-error', logger: mockLogger },
        );

        const streamError = new Error('Stream processing failed');

        // Act - Handle stream error
        await streamingHandler.handleStreamError(session.id, streamError);

        // Assert - Verify error handling conversation
        expect(mockLogger.error).toHaveBeenCalledWith('Stream error occurred', {
          streamId: session.id,
          error: 'Stream processing failed',
        });
        expect(mockMetricsCollector.recordStreamError).toHaveBeenCalledWith(
          session.id,
          'Stream processing failed',
        );
        expect(mockEventEmitter.emit).toHaveBeenCalledWith('stream:error', {
          streamId: session.id,
          error: streamError,
        });
        // Should also cleanup resources
        expect(mockStreamManager.closeStream).toHaveBeenCalledWith(session.id);
        expect(mockBufferManager.releaseBuffer).toHaveBeenCalledWith(session.id);
      });
    });
  });

  describe('🧪 London School Patterns - Streaming Workflow', () => {
    it('should demonstrate complete streaming lifecycle', async () => {
      // Arrange - Mock complete streaming workflow
      mockStreamManager.createStream.mockReturnValue(true);
      mockStreamManager.writeToStream.mockReturnValue(2048);
      mockFlowController.checkBackpressure.mockReturnValue({ shouldPause: false });
      mockStreamManager.closeStream.mockReturnValue(undefined);
      mockBufferManager.releaseBuffer.mockReturnValue(undefined);

      const streamingHandler = new MockMCPStreamingHandler();

      const context: MCPContext = {
        sessionId: 'workflow-session',
        logger: mockLogger,
      };

      // Act - Complete streaming workflow

      // 1. Create stream
      const session = await streamingHandler.createStreamingSession(
        {
          jsonrpc: '2.0',
          id: 'workflow-stream',
          method: 'complete/workflow',
          params: { bufferSize: 32768 },
        },
        context,
      );

      // 2. Stream multiple chunks
      for (let i = 0; i < 3; i++) {
        await streamingHandler.handleStreamData(session.id, {
          id: session.id,
          sequence: i,
          data: { chunk: i, content: `data-${i}` },
          isLast: i === 2,
          timestamp: new Date(),
        });
      }

      // Assert - Verify complete workflow conversation (London School focus)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating streaming session',
        expect.objectContaining({
          streamId: session.id,
          method: 'complete/workflow',
        }),
      );
      expect(mockStreamManager.createStream).toHaveBeenCalledTimes(1);
      expect(mockMetricsCollector.recordStreamCreated).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('stream:created', expect.any(Object));

      // Verify chunk processing
      expect(mockLogger.debug).toHaveBeenCalledTimes(3); // One per chunk
      expect(mockStreamManager.writeToStream).toHaveBeenCalledTimes(3);
      expect(mockMetricsCollector.recordDataTransfer).toHaveBeenCalledTimes(4); // 3 chunks + 1 summary

      // Verify stream end
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'stream:ended',
        expect.objectContaining({
          streamId: session.id,
          summary: expect.objectContaining({
            totalChunks: 3,
            totalBytes: expect.any(Number),
          }),
        }),
      );
    });
  });

  // Clean test isolation - London School principle
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
