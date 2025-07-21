#!/usr/bin/env node
/**
 * Document Manager Service
 * Core service for managing service documents, ADRs, roadmaps, and specifications
 */

import { EventEmitter } from 'events';
import { ClaudeFlowMCPServer } from '../../src/mcp/mcp-server.js';

export class DocumentManagerService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'document-manager';
    this.version = '1.0.0';
    this.port = options.port || 4001;
    this.mcpServer = new ClaudeFlowMCPServer();
    this.status = 'stopped';
  }

  async start() {
    console.log(`🚀 Starting Document Manager Service on port ${this.port}`);
    
    await this.mcpServer.initializeMemory();
    this.status = 'running';
    
    this.emit('started', { service: this.name, port: this.port });
    console.log(`✅ Document Manager Service running`);
    
    return this;
  }

  async stop() {
    this.status = 'stopped';
    this.emit('stopped', { service: this.name });
    console.log(`🛑 Document Manager Service stopped`);
  }

  async createDocument(serviceName, documentType, content, metadata = {}) {
    return await this.mcpServer.handleServiceDocumentManager({
      action: 'create',
      serviceName,
      documentType,
      content,
      approvalMetadata: metadata
    });
  }

  async getDocument(serviceName, documentType) {
    return await this.mcpServer.handleServiceDocumentManager({
      action: 'get',
      serviceName,
      documentType
    });
  }

  async listDocuments(serviceName = null) {
    return await this.mcpServer.handleServiceDocumentManager({
      action: 'list',
      serviceName,
      documentType: 'all'
    });
  }

  async validateDocument(serviceName, documentType) {
    return await this.mcpServer.handleServiceDocumentValidator({
      validateType: 'single-document',
      serviceName,
      documentType
    });
  }

  getStatus() {
    return {
      service: this.name,
      version: this.version,
      status: this.status,
      port: this.port,
      endpoints: [
        'POST /documents/create',
        'GET /documents/:service/:type',
        'GET /documents/list',
        'POST /documents/validate'
      ]
    };
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new DocumentManagerService();
  await service.start();
  
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });
}