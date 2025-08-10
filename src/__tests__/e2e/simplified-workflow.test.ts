/**
 * Simplified E2E Workflow Test
 * Tests core document-driven development workflow without complex dependencies
 */

import { DocumentDrivenSystem } from '../../core/document-driven-system';
import { RealFileSystemTestHelper } from '../helpers/filesystem-test-helper';

describe('Simplified E2E Workflow Tests', () => {
  let documentSystem: DocumentDrivenSystem;
  let fsHelper: RealFileSystemTestHelper;

  const TEST_PROJECT_PATH = '/tmp/claude-zen-simple-test';
  const E2E_TIMEOUT = 30000; // 30 seconds

  beforeAll(async () => {
    fsHelper = new RealFileSystemTestHelper();
    await fsHelper.createDirectory(TEST_PROJECT_PATH);
  }, E2E_TIMEOUT);

  afterAll(async () => {
    try {
      await fsHelper.deleteDirectory(TEST_PROJECT_PATH);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Document-Driven Development Workflow', () => {
    beforeEach(async () => {
      documentSystem = new DocumentDrivenSystem();
      await documentSystem.initialize();
    });

    it('should process a vision document successfully', async () => {
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      const visionContent = `
# Simple Vision Test

## Overview
A simple test vision document to validate the document-driven development workflow.

## Features
- Basic document processing
- Workflow validation
- System integration testing

## Technical Requirements
- Document parsing
- Metadata extraction
- Event emission

## Success Criteria
- Document processed successfully
- Events emitted correctly
- No errors during processing
`;

      const visionPath = `${TEST_PROJECT_PATH}/docs/01-vision/simple-vision.md`;
      await fsHelper.createFile(visionPath, visionContent);

      let documentProcessed = false;
      let processedDocument: any = null;

      // Listen for document processing events
      documentSystem.on('document:processed', (event) => {
        documentProcessed = true;
        processedDocument = event;
      });

      // Process the vision document
      await documentSystem.processVisionaryDocument(workspaceId, visionPath);

      // Verify the document was processed
      expect(documentProcessed).toBe(true);
      expect(processedDocument).toBeDefined();
      expect(processedDocument.document.type).toBe('vision');
      expect(processedDocument.document.path).toBe(visionPath);
      expect(processedDocument.document.content).toContain('Simple Vision Test');
    });

    it('should handle multiple document types in sequence', async () => {
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
      const processedDocuments: any[] = [];

      // Listen for all document processing events
      documentSystem.on('document:processed', (event) => {
        processedDocuments.push(event);
      });

      // Create and process vision document
      const visionContent = `
# Multi-Document Workflow

## Overview
Testing sequential document processing workflow.
`;

      const visionPath = `${TEST_PROJECT_PATH}/docs/01-vision/multi-vision.md`;
      await fsHelper.createFile(visionPath, visionContent);
      await documentSystem.processVisionaryDocument(workspaceId, visionPath);

      // Create and process ADR document
      const adrContent = `
# Architecture Decision Record

## Decision
Use document-driven development approach.

## Context
Need structured development workflow.

## Consequences
Improved traceability and documentation.
`;

      const adrPath = `${TEST_PROJECT_PATH}/docs/02-adrs/adr-001-document-driven.md`;
      await fsHelper.createFile(adrPath, adrContent);
      await documentSystem.processVisionaryDocument(workspaceId, adrPath);

      // Create and process PRD document
      const prdContent = `
# Product Requirements Document

## Requirements
- Document processing capability
- Event-driven architecture
- Metadata extraction

## Acceptance Criteria
- All document types supported
- Events emitted for processing
- Metadata correctly extracted
`;

      const prdPath = `${TEST_PROJECT_PATH}/docs/03-prds/workflow-prd.md`;
      await fsHelper.createFile(prdPath, prdContent);
      await documentSystem.processVisionaryDocument(workspaceId, prdPath);

      // Verify all documents were processed
      expect(processedDocuments.length).toBe(3);

      const visionEvent = processedDocuments.find((d) => d.document.type === 'vision');
      const adrEvent = processedDocuments.find((d) => d.document.type === 'adr');
      const prdEvent = processedDocuments.find((d) => d.document.type === 'prd');

      expect(visionEvent).toBeDefined();
      expect(adrEvent).toBeDefined();
      expect(prdEvent).toBeDefined();

      expect(visionEvent.document.content).toContain('Multi-Document Workflow');
      expect(adrEvent.document.content).toContain('Architecture Decision Record');
      expect(prdEvent.document.content).toContain('Product Requirements Document');
    });

    it('should extract metadata from documents correctly', async () => {
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      const documentWithMetadata = `
# Document with Metadata

Author: Test User
Created: 2024-01-01
Status: Draft
Related: doc1.md, doc2.md

## Overview
This document contains metadata for testing extraction.

## Content
Test content with metadata in the header.
`;

      const docPath = `${TEST_PROJECT_PATH}/docs/05-features/metadata-test.md`;
      await fsHelper.createFile(docPath, documentWithMetadata);

      let processedDocument: any = null;

      documentSystem.on('document:processed', (event) => {
        if (event['document']?.['path'] === docPath) {
          processedDocument = event;
        }
      });

      await documentSystem.processVisionaryDocument(workspaceId, docPath);

      expect(processedDocument).toBeDefined();
      expect(processedDocument.document.metadata).toBeDefined();
      expect(processedDocument.document.metadata.author).toBe('Test User');
      expect(processedDocument.document.metadata.status).toBe('Draft');
      expect(processedDocument.document.metadata.relatedDocs).toEqual(['doc1.md', 'doc2.md']);
    });

    it('should maintain workspace state correctly', async () => {
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      // Create multiple documents
      const docs = [
        {
          path: `${TEST_PROJECT_PATH}/docs/01-vision/workspace-vision.md`,
          content: '# Workspace Vision\n\nTest workspace management.',
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/04-epics/workspace-epic.md`,
          content: '# Workspace Epic\n\nTest epic management.',
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/06-tasks/workspace-task.md`,
          content: '# Workspace Task\n\nTest task management.',
        },
      ];

      for (const doc of docs) {
        await fsHelper.createFile(doc.path, doc.content);
        await documentSystem.processVisionaryDocument(workspaceId, doc.path);
      }

      // Get workspace documents
      const workspaceDocuments = documentSystem.getWorkspaceDocuments(workspaceId);

      expect(workspaceDocuments.size).toBeGreaterThanOrEqual(3);

      // Check that all documents are tracked
      const docPaths = Array.from(workspaceDocuments.keys());
      expect(docPaths).toContain(docs[0]?.path);
      expect(docPaths).toContain(docs[1]?.path);
      expect(docPaths).toContain(docs[2]?.path);

      // Check document content is accessible
      const visionDoc = workspaceDocuments.get(docs[0]?.path);
      expect(visionDoc).toBeDefined();
      expect(visionDoc?.type).toBe('vision');
      expect(visionDoc?.content).toContain('Workspace Vision');
    });

    it('should handle concurrent document processing gracefully', async () => {
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);
      const processedDocuments: any[] = [];

      documentSystem.on('document:processed', (event) => {
        processedDocuments.push(event);
      });

      // Create multiple documents concurrently
      const concurrentDocs = Array.from({ length: 5 }, (_, i) => ({
        path: `${TEST_PROJECT_PATH}/docs/06-tasks/concurrent-task-${i}.md`,
        content: `# Concurrent Task ${i}\n\nTask ${i} for concurrent processing test.`,
      }));

      // Write all files
      await Promise.all(concurrentDocs?.map((doc) => fsHelper.createFile(doc.path, doc.content)));

      // Process all documents concurrently
      const processingPromises = concurrentDocs?.map((doc) =>
        documentSystem.processVisionaryDocument(workspaceId, doc.path)
      );

      await Promise.all(processingPromises);

      // Verify all documents were processed
      expect(processedDocuments.length).toBeGreaterThanOrEqual(5);

      // Verify workspace state is consistent
      const workspaceDocuments = documentSystem.getWorkspaceDocuments(workspaceId);
      const taskDocs = Array.from(workspaceDocuments.values()).filter((doc) =>
        doc.path.includes('concurrent-task')
      );

      expect(taskDocs.length).toBe(5);

      // Verify each document is correctly typed and contains expected content
      taskDocs.forEach((doc, index) => {
        expect(doc.type).toBe('task');
        expect(doc.content).toContain(`Concurrent Task ${index}`);
      });
    });

    it('should demonstrate complete workflow efficiency', async () => {
      const startTime = Date.now();
      const workspaceId = await documentSystem.loadWorkspace(TEST_PROJECT_PATH);

      // Simulate a complete development workflow
      const workflowDocs = [
        {
          path: `${TEST_PROJECT_PATH}/docs/01-vision/efficient-vision.md`,
          content: `
# Efficient Workflow Vision

## Overview
Demonstrate efficient end-to-end workflow processing.

## Goals
- Fast document processing
- Minimal resource usage
- Reliable workflow execution
`,
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/02-adrs/efficient-adr.md`,
          content: `
# ADR: Efficient Processing Architecture

## Decision
Implement streamlined document processing pipeline.

## Rationale
Optimize for speed and reliability.
`,
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/03-prds/efficient-prd.md`,
          content: `
# Efficient Processing PRD

## Requirements
- Sub-second processing times
- Memory efficient operations
- Error resilience

## Success Metrics
- Processing time < 1000ms
- Memory usage < 50MB
- Zero processing errors
`,
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/04-epics/efficient-epic.md`,
          content: `
# Efficiency Epic

## Goal
Achieve optimal workflow processing performance.

## Features
- Optimized parsing
- Efficient memory usage
- Fast metadata extraction
`,
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/05-features/efficient-feature.md`,
          content: `
# Fast Processing Feature

## Implementation
Streamlined document processing with minimal overhead.

## Performance Targets
- Parse time: <100ms
- Memory: <10MB per document
- Throughput: >50 docs/sec
`,
        },
        {
          path: `${TEST_PROJECT_PATH}/docs/06-tasks/efficient-task.md`,
          content: `
# Efficiency Task

## Implementation
Optimize document processing pipeline for maximum throughput.

## Deliverables
- Optimized parser
- Memory management
- Performance monitoring
`,
        },
      ];

      let processedCount = 0;
      const processingTimes: number[] = [];

      documentSystem.on('document:processed', (event) => {
        processedCount++;
        processingTimes.push(Date.now() - startTime);
      });

      // Process workflow documents sequentially to simulate realistic development
      for (const doc of workflowDocs) {
        await fsHelper.createFile(doc.path, doc.content);
        const docStartTime = Date.now();
        await documentSystem.processVisionaryDocument(workspaceId, doc.path);
        const docProcessingTime = Date.now() - docStartTime;

        // Each document should process quickly
        expect(docProcessingTime).toBeLessThan(1000); // Less than 1 second
      }

      const totalTime = Date.now() - startTime;

      // Verify workflow completion
      expect(processedCount).toBe(6);
      expect(totalTime).toBeLessThan(10000); // Complete workflow under 10 seconds

      // Verify average processing time
      const avgProcessingTime =
        processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
      expect(avgProcessingTime).toBeLessThan(5000); // Average under 5 seconds

      // Verify workspace final state
      const finalDocuments = documentSystem.getWorkspaceDocuments(workspaceId);
      expect(finalDocuments.size).toBeGreaterThanOrEqual(6);
    });
  });
});
